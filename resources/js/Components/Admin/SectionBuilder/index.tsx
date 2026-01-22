import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
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
    Pencil,
    Trash2,
    Copy,
    ChevronUp,
    ChevronDown,
    Eye,
    EyeOff,
    LayoutTemplate,
    Type,
    Image as ImageIcon,
    Users,
    MessageSquareQuote,
    HelpCircle,
    Phone,
    Megaphone,
    Images,
    Code,
    Sparkles,
    Package,
    X,
    Check,
    // About Page Icons
    Target,
    BookOpen,
    Heart,
    // Services Page Icons
    Grid3X3,
    // Contact Page Icons
    MessageCircle,
    FileEdit,
    LayoutGrid,
    PhoneCall,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SectionEditor from './SectionEditor';

export interface Section {
    id: number;
    component_type: string;
    order: number;
    is_visible: boolean;
    content: Record<string, any>;
    styles: Record<string, any>;
    settings: Record<string, any>;
}

export interface ComponentType {
    name: string;
    description: string;
    icon?: string;
    fields: string[];
}

interface SectionBuilderProps {
    pageId: number;
    sections: Section[];
    componentTypes: Record<string, ComponentType>;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    // Home Page Blocks
    hero: LayoutTemplate,
    text: Type,
    services_grid: Package,
    testimonials: MessageSquareQuote,
    faq: HelpCircle,
    team: Users,
    contact: Phone,
    cta: Megaphone,
    image_gallery: Images,
    custom: Code,
    features: Sparkles,
    
    // About Page Blocks
    about_hero: LayoutTemplate,
    about_mission: Target,
    about_story: BookOpen,
    about_values: Heart,
    about_team: Users,
    about_cta: Megaphone,
    
    // Services Page Blocks
    services_hero: LayoutTemplate,
    services_categories: Grid3X3,
    services_cta: Megaphone,
    
    // Contact Page Blocks
    contact_hero: MessageCircle,
    contact_form: FileEdit,
    contact_info_cards: LayoutGrid,
    contact_cta: PhoneCall,
};

// Sortable Section Item Component
interface SortableSectionItemProps {
    section: Section;
    index: number;
    totalSections: number;
    isDeleting: boolean;
    componentTypes: Record<string, ComponentType>;
    onEdit: (section: Section) => void;
    onDelete: (id: number) => void;
    onDuplicate: (id: number) => void;
    onMoveUp: (id: number) => void;
    onMoveDown: (id: number) => void;
    onToggleVisibility: (section: Section) => void;
    getComponentIcon: (type: string) => React.ReactNode;
    getComponentName: (type: string) => string;
}

function SortableSectionItem({
    section,
    index,
    totalSections,
    isDeleting,
    onEdit,
    onDelete,
    onDuplicate,
    onMoveUp,
    onMoveDown,
    onToggleVisibility,
    getComponentIcon,
    getComponentName,
}: SortableSectionItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative rounded-xl border bg-white transition-all duration-200 ${
                isDragging 
                    ? 'shadow-2xl ring-2 ring-[#c9a962] border-[#c9a962]'
                    : section.is_visible
                        ? 'border-slate-200 hover:border-[#c9a962]/50 hover:shadow-lg'
                        : 'border-dashed border-slate-300 bg-slate-50/50 opacity-60'
            }`}
        >
            <div className="flex items-center gap-4 p-4">
                {/* Drag Handle - Make it a proper interactive element */}
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors touch-none p-1 -m-1 rounded focus:outline-none focus:ring-2 focus:ring-[#c9a962]/50"
                    aria-label="Drag to reorder"
                >
                    <GripVertical className="h-5 w-5" />
                </button>

                {/* Icon & Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        section.is_visible ? 'bg-[#c9a962]/10 text-[#c9a962]' : 'bg-slate-200 text-slate-400'
                    }`}>
                        {getComponentIcon(section.component_type)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-slate-800 truncate">
                            {getComponentName(section.component_type)}
                        </h4>
                        <p className="text-xs text-slate-500">
                            {section.is_visible ? 'Visible' : 'Hidden'} • Order: {section.order}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Move Up */}
                    <button
                        type="button"
                        onClick={() => onMoveUp(section.id)}
                        disabled={index === 0}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move up"
                    >
                        <ChevronUp className="h-4 w-4" />
                    </button>

                    {/* Move Down */}
                    <button
                        type="button"
                        onClick={() => onMoveDown(section.id)}
                        disabled={index === totalSections - 1}
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Move down"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>

                    <div className="w-px h-6 bg-slate-200 mx-1" />

                    {/* Toggle Visibility */}
                    <button
                        type="button"
                        onClick={() => onToggleVisibility(section)}
                        className={`p-2 rounded-lg transition-colors ${
                            section.is_visible
                                ? 'text-emerald-500 hover:bg-emerald-50'
                                : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={section.is_visible ? 'Hide section' : 'Show section'}
                    >
                        {section.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>

                    {/* Edit */}
                    <button
                        type="button"
                        onClick={() => onEdit(section)}
                        className="p-2 rounded-lg text-[#c9a962] hover:bg-[#c9a962]/10 transition-colors"
                        title="Edit section"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>

                    {/* Duplicate */}
                    <button
                        type="button"
                        onClick={() => onDuplicate(section.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        title="Duplicate section"
                    >
                        <Copy className="h-4 w-4" />
                    </button>

                    {/* Delete */}
                    <button
                        type="button"
                        onClick={() => onDelete(section.id)}
                        disabled={isDeleting}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Delete section"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Quick Content Preview */}
            {section.content && Object.keys(section.content).length > 0 && (
                <div className="px-4 pb-4 pt-0">
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(section.content).slice(0, 3).map(([key, value]) => (
                            <span
                                key={key}
                                className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
                            >
                                <span className="font-medium">{key}:</span>
                                <span className="truncate max-w-[120px]">
                                    {typeof value === 'string' ? value : JSON.stringify(value).slice(0, 20)}
                                </span>
                            </span>
                        ))}
                        {Object.keys(section.content).length > 3 && (
                            <span className="text-xs text-slate-400">
                                +{Object.keys(section.content).length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function SectionBuilder({ pageId, sections = [], componentTypes = {} }: SectionBuilderProps) {
    const [localSections, setLocalSections] = useState<Section[]>(sections);
    const [editingSection, setEditingSection] = useState<Section | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [activeId, setActiveId] = useState<number | null>(null);

    // Sync local state when sections prop changes
    React.useEffect(() => {
        setLocalSections(sections);
    }, [sections]);

    // DnD sensors - use MouseSensor and TouchSensor for better compatibility
    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Debug: Log sections data when component renders
    console.log('[SectionBuilder] Received sections:', sections.map(s => ({
        id: s.id,
        type: s.component_type,
        hasContent: Object.keys(s.content || {}).length > 0,
        contentKeys: Object.keys(s.content || {}),
    })));

    const handleDragStart = (event: DragStartEvent) => {
        console.log('[SectionBuilder] Drag started:', event.active.id);
        setActiveId(event.active.id as number);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        console.log('[SectionBuilder] Drag ended:', active.id, '->', over?.id);
        setActiveId(null);
        
        if (over && active.id !== over.id) {
            const oldIndex = localSections.findIndex(s => s.id === active.id);
            const newIndex = localSections.findIndex(s => s.id === over.id);
            
            // Update local state immediately for smooth UI
            const newSections = arrayMove(localSections, oldIndex, newIndex);
            setLocalSections(newSections);
            
            // Send reorder request to server
            const reorderData = newSections.map((s, idx) => ({
                id: s.id,
                order: idx + 1,
            }));
            
            router.post(`/admin/sections/reorder`, {
                sections: reorderData,
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('Sections reordered successfully!');
                },
                onError: () => {
                    // Revert on error
                    setLocalSections(sections);
                    toast.error('Failed to reorder sections');
                },
            });
        }
    };

    const activeSection = activeId ? localSections.find(s => s.id === activeId) : null;

    const handleEditClick = (section: Section) => {
        console.log('[SectionBuilder] Opening section for editing:', section.id, section.component_type, section.content);
        setEditingSection(section);
    };

    const handleAddSection = (componentType: string) => {
        router.post('/admin/sections', {
            page_id: pageId,
            component_type: componentType,
            is_visible: true,
            content: {},
            styles: {},
            settings: {},
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                toast.success('Section added successfully!');
            },
            onError: () => {
                toast.error('Failed to add section');
            },
        });
    };

    const handleUpdateSection = (section: Section, updates: Partial<Section>) => {
        // Prepare the update payload - only include fields that are being updated
        const payload: Record<string, any> = {};
        
        // Handle content - merge with existing content if partial update
        if (updates.content !== undefined) {
            payload.content = JSON.stringify(updates.content);
        }
        
        // Handle styles - merge with existing styles if partial update
        if (updates.styles !== undefined) {
            payload.styles = JSON.stringify(updates.styles);
        }
        
        // Handle settings if provided
        if (updates.settings !== undefined) {
            payload.settings = JSON.stringify(updates.settings);
        }
        
        // Handle visibility toggle
        if (updates.is_visible !== undefined) {
            payload.is_visible = updates.is_visible;
        }
        
        router.put(`/admin/sections/${section.id}`, payload, {
            preserveScroll: true,
            onSuccess: () => {
                setEditingSection(null);
                toast.success('Section updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update section');
            },
        });
    };

    const handleDeleteSection = (sectionId: number) => {
        setIsDeleting(sectionId);
        router.delete(`/admin/sections/${sectionId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setIsDeleting(null);
                toast.success('Section deleted successfully!');
            },
            onError: () => {
                setIsDeleting(null);
                toast.error('Failed to delete section');
            },
        });
    };

    const handleDuplicateSection = (sectionId: number) => {
        router.post(`/admin/sections/${sectionId}/duplicate`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Section duplicated successfully!');
            },
            onError: () => {
                toast.error('Failed to duplicate section');
            },
        });
    };

    const handleMoveUp = (sectionId: number) => {
        router.post(`/admin/sections/${sectionId}/move-up`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Section moved up!');
            },
        });
    };

    const handleMoveDown = (sectionId: number) => {
        router.post(`/admin/sections/${sectionId}/move-down`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Section moved down!');
            },
        });
    };

    const handleToggleVisibility = (section: Section) => {
        router.put(`/admin/sections/${section.id}`, {
            is_visible: !section.is_visible,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(section.is_visible ? 'Section hidden' : 'Section visible');
            },
        });
    };

    const getComponentIcon = (type: string) => {
        const IconComponent = iconMap[type] || LayoutTemplate;
        return <IconComponent className="h-5 w-5" />;
    };

    const getComponentName = (type: string) => {
        return componentTypes[type]?.name || type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <div className="space-y-4">
            {/* Section List with Drag & Drop */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={localSections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3">
                        {localSections.length > 0 ? (
                            localSections.map((section, index) => (
                                <SortableSectionItem
                                    key={section.id}
                                    section={section}
                                    index={index}
                                    totalSections={localSections.length}
                                    isDeleting={isDeleting === section.id}
                                    componentTypes={componentTypes}
                                    onEdit={handleEditClick}
                                    onDelete={handleDeleteSection}
                                    onDuplicate={handleDuplicateSection}
                                    onMoveUp={handleMoveUp}
                                    onMoveDown={handleMoveDown}
                                    onToggleVisibility={handleToggleVisibility}
                                    getComponentIcon={getComponentIcon}
                                    getComponentName={getComponentName}
                                />
                            ))
                        ) : (
                            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                                <div className="mx-auto h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                                    <LayoutTemplate className="h-6 w-6 text-slate-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-1">No sections yet</h3>
                                <p className="text-sm text-slate-500 mb-4">Start building your page by adding sections</p>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b08d4a] transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add First Section
                                </button>
                            </div>
                        )}
                    </div>
                </SortableContext>

                {/* Drag Overlay for visual feedback */}
                <DragOverlay>
                    {activeSection ? (
                        <div className="rounded-xl border-2 border-[#c9a962] bg-white shadow-2xl opacity-90 p-4">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c9a962]/10 text-[#c9a962]">
                                    {getComponentIcon(activeSection.component_type)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-800">
                                        {getComponentName(activeSection.component_type)}
                                    </h4>
                                    <p className="text-xs text-slate-500">Dragging...</p>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Add Section Button */}
            {localSections.length > 0 && (
                <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full rounded-xl border-2 border-dashed border-slate-200 bg-white p-4 text-center hover:border-[#c9a962] hover:bg-[#c9a962]/5 transition-all group"
                >
                    <div className="flex items-center justify-center gap-2 text-slate-500 group-hover:text-[#c9a962]">
                        <Plus className="h-5 w-5" />
                        <span className="font-medium">Add Section</span>
                    </div>
                </button>
            )}

            {/* Add Section Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                        onClick={() => setIsAddModalOpen(false)}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header - Matching Menu Modal Design */}
                        <div className="relative bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-8 py-6">
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                            </div>
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                        <Plus className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            Add Section
                                        </h3>
                                        <p className="text-sm text-white/60">
                                            Choose a component type to add to your page
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                                >
                                    <X className="h-5 w-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="grid grid-cols-2 gap-4">
                                {Object.entries(componentTypes).map(([type, config]) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleAddSection(type)}
                                        className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-[#c9a962] hover:bg-white hover:shadow-lg text-left transition-all group"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c9a962]/10 text-[#c9a962] group-hover:bg-[#c9a962] group-hover:text-white transition-colors">
                                            {getComponentIcon(type)}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-semibold text-gray-800 group-hover:text-[#c9a962] transition-colors">{config.name}</h4>
                                            <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Section Modal */}
            {editingSection && (
                <SectionEditor
                    section={editingSection}
                    componentType={componentTypes[editingSection.component_type]}
                    onSave={(updates) => handleUpdateSection(editingSection, updates)}
                    onClose={() => setEditingSection(null)}
                />
            )}
        </div>
    );
}
