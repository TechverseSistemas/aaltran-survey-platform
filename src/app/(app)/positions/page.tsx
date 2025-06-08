import CreatePositionDialog from '@/components/positions/create-dialog';
import PositionsList from '@/components/positions/list';

export default function Positions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cargos</h1>

        <CreatePositionDialog />
      </div>

      <PositionsList />
    </div>
  );
}
