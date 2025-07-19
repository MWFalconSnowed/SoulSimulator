import { useState } from "react";
import { Save, Edit3, Trash2, Settings } from "lucide-react";
import { FantasyButton } from "@/components/ui/fantasy-button";
import { useWorldStore, WorldEntity } from "@/stores/world-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface EntityPropertiesProps {
  entity: WorldEntity;
}

export function EntityProperties({ entity }: EntityPropertiesProps) {
  const { updateEntity, removeEntity } = useWorldStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(entity.name);
  const [editedProperties, setEditedProperties] = useState({ ...entity.properties });

  const handleSave = () => {
    updateEntity(entity.id, {
      name: editedName,
      properties: editedProperties
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(entity.name);
    setEditedProperties({ ...entity.properties });
    setIsEditing(false);
  };

  const handlePropertyChange = (key: string, value: any) => {
    setEditedProperties(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDelete = () => {
    if (confirm(`Delete entity "${entity.name}"?`)) {
      removeEntity(entity.id);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-amber-200">Entity Properties</h3>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <FantasyButton
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-green-400 hover:text-green-300"
              >
                <Save className="h-3 w-3" />
              </FantasyButton>
              <FantasyButton
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </FantasyButton>
            </>
          ) : (
            <>
              <FantasyButton
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-amber-400 hover:text-amber-300"
              >
                <Edit3 className="h-3 w-3" />
              </FantasyButton>
              <FantasyButton
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </FantasyButton>
            </>
          )}
        </div>
      </div>

      <Separator className="bg-amber-600/30" />

      {/* Basic Info */}
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-amber-300 font-semibold">Name</Label>
          {isEditing ? (
            <Input
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="mt-1 bg-amber-950/30 border-amber-600/40 text-amber-100"
            />
          ) : (
            <div className="text-sm text-amber-100 mt-1">{entity.name}</div>
          )}
        </div>

        <div>
          <Label className="text-xs text-amber-300 font-semibold">Type</Label>
          <div className="text-sm text-amber-100 mt-1">{entity.type}</div>
        </div>

        <div>
          <Label className="text-xs text-amber-300 font-semibold">Position</Label>
          <div className="text-sm text-amber-100 mt-1">
            X: {Math.round(entity.position.x)}, Y: {Math.round(entity.position.y)}
          </div>
        </div>

        <div>
          <Label className="text-xs text-amber-300 font-semibold">Status</Label>
          <div className={`text-sm mt-1 ${entity.isActive ? 'text-green-400' : 'text-red-400'}`}>
            {entity.isActive ? 'Active' : 'Inactive'}
          </div>
        </div>
      </div>

      <Separator className="bg-amber-600/30" />

      {/* Properties */}
      <div className="space-y-3">
        <Label className="text-xs text-amber-300 font-semibold">Properties</Label>
        {Object.entries(isEditing ? editedProperties : entity.properties).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs text-amber-400/80 capitalize">{key}</Label>
            {isEditing ? (
              <Input
                value={value?.toString() || ''}
                onChange={(e) => {
                  const newValue = isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                  handlePropertyChange(key, newValue);
                }}
                className="bg-amber-950/30 border-amber-600/40 text-amber-100 text-sm"
              />
            ) : (
              <div className="text-sm text-amber-100 bg-amber-950/20 px-2 py-1 rounded border border-amber-600/20">
                {value?.toString() || 'null'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Entity Statistics */}
      <Separator className="bg-amber-600/30" />
      <div className="space-y-2">
        <Label className="text-xs text-amber-300 font-semibold">Statistics</Label>
        <div className="text-xs text-amber-400/70">
          Created: {entity.createdAt.toLocaleTimeString()}
        </div>
        <div className="text-xs text-amber-400/70">
          ID: #{entity.id}
        </div>
      </div>
    </div>
  );
}