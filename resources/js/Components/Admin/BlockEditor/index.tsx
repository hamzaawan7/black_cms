import React, { useState } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Plus,
    GripVertical,
    Trash2,
    Copy,
    ChevronUp,
    ChevronDown,
    Settings,
    Eye,
    EyeOff,
    Type,
    AlignLeft,
    Image as ImageIcon,
    Images,
    Layers,
    Video,
    MousePointerClick,
    LayoutGrid,
    LayoutDashboard,
    List,
    BarChart3,
    ClipboardList,
    MoveVertical,
    Minus,
    Code,
    Sparkles,
    X,
    Package,
    Grid3X3,
    Users,
    MessageCircle,
    HelpCircle,
    Phone,
    FileText,
    Heart,
    Award,
    ListOrdered,
    Megaphone,
    LayoutList,
    ArrowRightCircle,
    Tags,
} from 'lucide-react';
import {
    ContentBlock,
    BlockType,
    blockDefinitions,
    createBlock,
    getBlockDefinition,
} from './types';
import BlockFieldEditor from './BlockFieldEditor';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Type,
    AlignLeft,
    Image: ImageIcon,
    Images,
    Layers,
    Video,
    MousePointerClick,
    LayoutGrid,
    LayoutDashboard,
    List,
    BarChart3,
    ClipboardList,
    MoveVertical,
    Minus,
    Code,
    Sparkles,
    Package,
    Grid3X3,
    Users,
    MessageCircle,
    HelpCircle,
    Phone,
    FileText,
    Heart,
    Award,
    ListOrdered,
    Megaphone,
    LayoutList,
    ArrowRightCircle,
    Tags,
};

interface BlockEditorProps {
    blocks: ContentBlock[];
    onChange: (blocks: ContentBlock[]) => void;
}

// Sortable Block Item
interface SortableBlockItemProps {
    block: ContentBlock;
    onEdit: (block: ContentBlock) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onToggleVisibility: (id: string) => void;
}

function SortableBlockItem({
    block,
    onEdit,
    onDelete,
    onDuplicate,
    onToggleVisibility,
}: SortableBlockItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    const definition = getBlockDefinition(block.type);
    const IconComponent = definition?.icon ? iconMap[definition.icon] : Type;
    const isHidden = block.settings?.visibility === 'hidden';

    // Get preview text from block data
    const getPreviewText = (): string => {
        const data = block.data as any;
        if (data.text) return data.text;
        if (data.content) return typeof data.content === 'string' ? data.content.slice(0, 50) : '';
        if (data.items?.length) return `${data.items.length} items`;
        if (data.src) return 'Image uploaded';
        if (data.url) return data.url;
        return '';
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative rounded-lg border bg-white transition-all duration-200 ${
                isDragging 
                    ? 'shadow-xl ring-2 ring-[#c9a962] border-[#c9a962]'
                    : isHidden
                        ? 'border-dashed border-slate-300 bg-slate-50/50 opacity-60'
                        : 'border-slate-200 hover:border-[#c9a962]/50 hover:shadow-md'
            }`}
        >
            <div className="flex items-center gap-3 p-3">
                {/* Drag Handle */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors touch-none p-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="h-4 w-4" />
                </button>

                {/* Block Icon & Info */}
                <div 
                    className="flex items-center gap-2 flex-1 min-w-0 cursor-pointer"
                    onClick={() => onEdit(block)}
                >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-md ${
                        isHidden ? 'bg-slate-200 text-slate-400' : 'bg-[#c9a962]/10 text-[#c9a962]'
                    }`}>
                        {IconComponent && <IconComponent className="h-4 w-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-slate-700 truncate">
                            {definition?.name || block.type}
                        </h4>
                        <p className="text-xs text-slate-400 truncate">
                            {getPreviewText() || 'Click to edit'}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        onClick={() => onToggleVisibility(block.id)}
                        className={`p-1.5 rounded transition-colors ${
                            isHidden
                                ? 'text-slate-400 hover:bg-slate-100'
                                : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                        title={isHidden ? 'Show block' : 'Hide block'}
                    >
                        {isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>

                    <button
                        type="button"
                        onClick={() => onDuplicate(block.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        title="Duplicate block"
                    >
                        <Copy className="h-3.5 w-3.5" />
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(block.id)}
                        className="p-1.5 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete block"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // DnD sensors
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 200, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
            const oldIndex = blocks.findIndex(b => b.id === active.id);
            const newIndex = blocks.findIndex(b => b.id === over.id);
            onChange(arrayMove(blocks, oldIndex, newIndex));
        }
    };

    const handleAddBlock = (type: BlockType) => {
        const newBlock = createBlock(type);
        onChange([...blocks, newBlock]);
        setIsAddModalOpen(false);
        setEditingBlock(newBlock);
    };

    const handleUpdateBlock = (updatedBlock: ContentBlock) => {
        onChange(blocks.map(b => b.id === updatedBlock.id ? updatedBlock : b));
        setEditingBlock(null);
    };

    const handleDeleteBlock = (id: string) => {
        onChange(blocks.filter(b => b.id !== id));
    };

    const handleDuplicateBlock = (id: string) => {
        const blockToDuplicate = blocks.find(b => b.id === id);
        if (blockToDuplicate) {
            const newBlock = {
                ...blockToDuplicate,
                id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };
            const index = blocks.findIndex(b => b.id === id);
            const newBlocks = [...blocks];
            newBlocks.splice(index + 1, 0, newBlock);
            onChange(newBlocks);
        }
    };

    const handleToggleVisibility = (id: string) => {
        onChange(blocks.map(b => {
            if (b.id === id) {
                return {
                    ...b,
                    settings: {
                        ...b.settings,
                        visibility: b.settings?.visibility === 'hidden' ? 'visible' : 'hidden',
                    },
                };
            }
            return b;
        }));
    };

    const activeBlock = activeId ? blocks.find(b => b.id === activeId) : null;
    const categories = ['all', 'content', 'media', 'layout', 'interactive', 'advanced'];
    const filteredBlocks = selectedCategory === 'all' 
        ? blockDefinitions 
        : blockDefinitions.filter(b => b.category === selectedCategory);

    return (
        <div className="space-y-3">
            {/* Block List */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={blocks.map(b => b.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-2">
                        {blocks.length > 0 ? (
                            blocks.map((block) => (
                                <SortableBlockItem
                                    key={block.id}
                                    block={block}
                                    onEdit={setEditingBlock}
                                    onDelete={handleDeleteBlock}
                                    onDuplicate={handleDuplicateBlock}
                                    onToggleVisibility={handleToggleVisibility}
                                />
                            ))
                        ) : (
                            <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                                <div className="mx-auto h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
                                    <Plus className="h-5 w-5 text-slate-400" />
                                </div>
                                <h3 className="text-sm font-medium text-slate-700 mb-1">No content blocks yet</h3>
                                <p className="text-xs text-slate-500 mb-3">Add blocks to build your section content</p>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-[#c9a962] rounded-md hover:bg-[#b08d4a] transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add First Block
                                </button>
                            </div>
                        )}
                    </div>
                </SortableContext>

                <DragOverlay>
                    {activeBlock ? (
                        <div className="rounded-lg border-2 border-[#c9a962] bg-white shadow-xl p-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#c9a962]/10 text-[#c9a962]">
                                    <GripVertical className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">
                                    {getBlockDefinition(activeBlock.type)?.name || activeBlock.type}
                                </span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Add Block Button */}
            {blocks.length > 0 && (
                <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full rounded-lg border-2 border-dashed border-slate-200 bg-white p-3 text-center hover:border-[#c9a962] hover:bg-[#c9a962]/5 transition-all group"
                >
                    <div className="flex items-center justify-center gap-2 text-slate-500 group-hover:text-[#c9a962]">
                        <Plus className="h-4 w-4" />
                        <span className="text-sm font-medium">Add Block</span>
                    </div>
                </button>
            )}

            {/* Add Block Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setIsAddModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-6 py-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                        <Plus className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Add Block</h3>
                                        <p className="text-xs text-white/60">Choose a content block to add</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <X className="h-4 w-4 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Category Tabs */}
                        <div className="flex gap-1 px-6 py-3 border-b border-gray-100 overflow-x-auto">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full capitalize transition-colors ${
                                        selectedCategory === cat
                                            ? 'bg-[#c9a962] text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Block Grid */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {filteredBlocks.map((def) => {
                                    const IconComp = iconMap[def.icon] || Type;
                                    return (
                                        <button
                                            key={def.type}
                                            type="button"
                                            onClick={() => handleAddBlock(def.type)}
                                            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-[#c9a962] hover:bg-white hover:shadow-md text-center transition-all group"
                                        >
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c9a962]/10 text-[#c9a962] group-hover:bg-[#c9a962] group-hover:text-white transition-colors">
                                                <IconComp className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-800">{def.name}</h4>
                                                <p className="text-[10px] text-gray-500 mt-0.5">{def.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Block Modal */}
            {editingBlock && (
                <BlockFieldEditor
                    block={editingBlock}
                    onSave={handleUpdateBlock}
                    onClose={() => setEditingBlock(null)}
                />
            )}
        </div>
    );
}
