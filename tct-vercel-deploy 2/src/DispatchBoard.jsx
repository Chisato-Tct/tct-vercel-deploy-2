import { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const licenseToVehicle = {
  普通免許: ['3t車'],
  中型免許: ['3t車', '4t車'],
  大型免許: ['3t車', '4t車', '大型車']
};

const SortableItem = ({ id, driver, route, vehicleType, cargoType, aiHint, onNotify, onViewMap, onOptimize }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: '#fff',
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '0.5rem',
    marginBottom: '1rem'
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <strong>ドライバー:</strong> {driver}<br />
      <strong>ルート:</strong> {route}<br />
      <strong>車種:</strong> {vehicleType} / <strong>積載:</strong> {cargoType}<br />
      <button onClick={() => onNotify(driver, route)}>LINE通知</button>
      <button onClick={() => onViewMap(route)}>地図</button>
      <button onClick={() => onOptimize(id)}>最適化提案</button>
      {aiHint && <div style={{ color: 'green', fontSize: '0.8rem', marginTop: '0.5rem' }}>🚀 AI提案: {aiHint}</div>}
    </div>
  );
};

export default function DispatchBoard() {
  const [assignments, setAssignments] = useState([
    { id: '1', driver: '佐藤一郎', route: '埼玉駅→東京駅', vehicleType: '3t車', cargoType: 'ドライ', aiHint: '' },
    { id: '2', driver: '山田花子', route: '東京駅→千葉駅', vehicleType: '4t車', cargoType: 'チルド', aiHint: '' },
    { id: '3', driver: '田中太郎', route: '川口駅→横浜駅', vehicleType: '大型車', cargoType: 'ドライ', aiHint: '' },
  ]);

  const [newDriver, setNewDriver] = useState('');
  const [newRoute, setNewRoute] = useState('');
  const [licenseType, setLicenseType] = useState('普通免許');
  const [vehicleType, setVehicleType] = useState('3t車');
  const [cargoType, setCargoType] = useState('ドライ');
  const availableVehicles = licenseToVehicle[licenseType];

  const addAssignment = () => {
    if (!newDriver || !newRoute || !availableVehicles.includes(vehicleType)) {
      alert('選択された免許で乗れる車種を選んでください。');
      return;
    }
    const newId = (assignments.length + 1).toString();
    setAssignments([...assignments, {
      id: newId, driver: newDriver, route: newRoute, vehicleType, cargoType, aiHint: ''
    }]);
    setNewDriver('');
    setNewRoute('');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = assignments.findIndex(item => item.id === active.id);
      const newIndex = assignments.findIndex(item => item.id === over.id);
      setAssignments(arrayMove(assignments, oldIndex, newIndex));
    }
  };

  const handleLineNotify = (driver, route) => {
    alert(`LINE通知送信：${driver}さんに「${route}」の指示を送信しました（※仮実装）`);
  };

  const handleViewMap = (route) => {
    const [from, to] = route.split('→');
    const url = `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(to)}`;
    window.open(url, '_blank');
  };

  const handleOptimize = (id) => {
    const suggestions = [
      '現在のルートより5分短縮可能なバイパス経路があります。',
      '午前中は渋滞が予想されるため、午後に出発を推奨します。',
      '別ルートを使うと信号待ちを減らせます。',
      '高速道路利用で燃費と時間効率が改善します。'
    ];
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    setAssignments(assignments.map(a => a.id === id ? { ...a, aiHint: random } : a));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>TCT 配車管理デモ</h1>
      <input placeholder="ドライバー名" value={newDriver} onChange={e => setNewDriver(e.target.value)} />
      <input placeholder="ルート（例：渋谷駅→品川駅）" value={newRoute} onChange={e => setNewRoute(e.target.value)} />
      <select value={licenseType} onChange={e => setLicenseType(e.target.value)}>
        <option>普通免許</option>
        <option>中型免許</option>
        <option>大型免許</option>
      </select>
      <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}>
        {availableVehicles.map(v => <option key={v}>{v}</option>)}
      </select>
      <select value={cargoType} onChange={e => setCargoType(e.target.value)}>
        <option>ドライ</option>
        <option>チルド</option>
      </select>
      <button onClick={addAssignment}>追加</button>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={assignments.map(a => a.id)} strategy={verticalListSortingStrategy}>
          <div>
            {assignments.map(a => (
              <SortableItem key={a.id} {...a}
                onNotify={handleLineNotify}
                onViewMap={handleViewMap}
                onOptimize={handleOptimize}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
