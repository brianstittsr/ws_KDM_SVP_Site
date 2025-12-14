"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Trash2,
  Edit,
  Mountain,
  Flag,
  ListTodo,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Calendar Event Types
export interface CalendarEventData {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay?: boolean;
  type: "meeting" | "rock" | "todo" | "issue" | "custom";
  color?: string;
  attendees?: string[];
  location?: string;
  recurring?: {
    frequency: "daily" | "weekly" | "monthly";
    until?: Date;
  };
}

interface BuiltInCalendarProps {
  events?: CalendarEventData[];
  onEventCreate?: (event: Omit<CalendarEventData, "id">) => void;
  onEventUpdate?: (id: string, event: Partial<CalendarEventData>) => void;
  onEventDelete?: (id: string) => void;
  className?: string;
  showHeader?: boolean;
  defaultView?: "month" | "week" | "day";
}

// Helper functions
const getDaysInMonth = (year: number, month: number): Date[] => {
  const days: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Add days from previous month to fill the first week
  const startDayOfWeek = firstDay.getDay();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }
  
  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }
  
  // Add days from next month to fill the last week
  const endDayOfWeek = lastDay.getDay();
  for (let i = 1; i < 7 - endDayOfWeek; i++) {
    days.push(new Date(year, month + 1, i));
  }
  
  return days;
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const getEventColor = (type: CalendarEventData["type"]): string => {
  switch (type) {
    case "meeting": return "bg-purple-500";
    case "rock": return "bg-blue-500";
    case "todo": return "bg-green-500";
    case "issue": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

const getEventIcon = (type: CalendarEventData["type"]) => {
  switch (type) {
    case "meeting": return <Users className="h-3 w-3" />;
    case "rock": return <Mountain className="h-3 w-3" />;
    case "todo": return <ListTodo className="h-3 w-3" />;
    case "issue": return <Flag className="h-3 w-3" />;
    default: return <CalendarIcon className="h-3 w-3" />;
  }
};

// Event Form Component
interface EventFormProps {
  event?: CalendarEventData;
  selectedDate?: Date;
  onSave: (event: Omit<CalendarEventData, "id">) => void;
  onCancel: () => void;
}

function EventForm({ event, selectedDate, onSave, onCancel }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || "");
  const [description, setDescription] = useState(event?.description || "");
  const [type, setType] = useState<CalendarEventData["type"]>(event?.type || "custom");
  const [startDate, setStartDate] = useState(
    event?.startDate.toISOString().split("T")[0] || 
    selectedDate?.toISOString().split("T")[0] || 
    new Date().toISOString().split("T")[0]
  );
  const [startTime, setStartTime] = useState(
    event?.startDate ? `${event.startDate.getHours().toString().padStart(2, "0")}:${event.startDate.getMinutes().toString().padStart(2, "0")}` : "09:00"
  );
  const [endTime, setEndTime] = useState(
    event?.endDate ? `${event.endDate.getHours().toString().padStart(2, "0")}:${event.endDate.getMinutes().toString().padStart(2, "0")}` : "10:00"
  );
  const [allDay, setAllDay] = useState(event?.allDay || false);
  const [location, setLocation] = useState(event?.location || "");

  const handleSubmit = () => {
    if (!title.trim()) return;

    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const start = new Date(startDate);
    start.setHours(startHour, startMin, 0, 0);

    const end = new Date(startDate);
    end.setHours(endHour, endMin, 0, 0);

    onSave({
      title,
      description,
      type,
      startDate: start,
      endDate: end,
      allDay,
      location,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(v) => setType(v as CalendarEventData["type"])}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="rock">Rock Milestone</SelectItem>
              <SelectItem value="todo">To-Do</SelectItem>
              <SelectItem value="issue">Issue</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={allDay}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end-time">End Time</Label>
          <Input
            id="end-time"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            disabled={allDay}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="all-day"
          checked={allDay}
          onChange={(e) => setAllDay(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="all-day" className="cursor-pointer">All day event</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location or meeting link"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event description"
          rows={3}
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!title.trim()}>
          {event ? "Update" : "Create"} Event
        </Button>
      </DialogFooter>
    </div>
  );
}

// Main Calendar Component
export function BuiltInCalendar({
  events = [],
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  className,
  showHeader = true,
  defaultView = "month",
}: BuiltInCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">(defaultView);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);

  const today = new Date();
  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = useCallback((date: Date): CalendarEventData[] => {
    return events.filter((event) => isSameDay(event.startDate, date));
  }, [events]);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateEvents = getEventsForDate(date);
    if (dateEvents.length === 0 && onEventCreate) {
      setShowEventForm(true);
    }
  };

  const handleEventClick = (event: CalendarEventData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleCreateEvent = (eventData: Omit<CalendarEventData, "id">) => {
    if (onEventCreate) {
      onEventCreate(eventData);
    }
    setShowEventForm(false);
    setSelectedDate(null);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent && onEventDelete) {
      onEventDelete(selectedEvent.id);
    }
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              {onEventCreate && (
                <Button size="sm" onClick={() => { setSelectedDate(new Date()); setShowEventForm(true); }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(date, today);
            const dateEvents = getEventsForDate(date);

            return (
              <div
                key={index}
                onClick={() => handleDateClick(date)}
                className={cn(
                  "min-h-[80px] p-1 border rounded-md cursor-pointer transition-colors",
                  isCurrentMonth ? "bg-background" : "bg-muted/30",
                  isToday && "ring-2 ring-primary",
                  "hover:bg-accent"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  !isCurrentMonth && "text-muted-foreground",
                  isToday && "text-primary"
                )}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dateEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className={cn(
                        "text-xs px-1 py-0.5 rounded truncate text-white flex items-center gap-1",
                        event.color || getEventColor(event.type)
                      )}
                    >
                      {getEventIcon(event.type)}
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                  {dateEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-1">
                      +{dateEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span>Meeting</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Rock</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>To-Do</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Issue</span>
          </div>
        </div>
      </CardContent>

      {/* Event Form Dialog */}
      <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? "Edit Event" : "Create Event"}
            </DialogTitle>
          </DialogHeader>
          <EventForm
            event={selectedEvent || undefined}
            selectedDate={selectedDate || undefined}
            onSave={handleCreateEvent}
            onCancel={() => { setShowEventForm(false); setSelectedDate(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEvent && getEventIcon(selectedEvent.type)}
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Badge className={getEventColor(selectedEvent.type)}>
                  {selectedEvent.type}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                {selectedEvent.startDate.toLocaleDateString()}
              </div>
              
              {!selectedEvent.allDay && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatTime(selectedEvent.startDate)} - {formatTime(selectedEvent.endDate)}
                </div>
              )}
              
              {selectedEvent.location && (
                <div className="text-sm">
                  <strong>Location:</strong> {selectedEvent.location}
                </div>
              )}
              
              {selectedEvent.description && (
                <div className="text-sm">
                  <strong>Description:</strong>
                  <p className="mt-1 text-muted-foreground">{selectedEvent.description}</p>
                </div>
              )}

              <DialogFooter className="gap-2">
                {onEventDelete && (
                  <Button variant="destructive" size="sm" onClick={handleDeleteEvent}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
                {onEventUpdate && (
                  <Button variant="outline" size="sm" onClick={() => {
                    setShowEventDetails(false);
                    setShowEventForm(true);
                  }}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                <Button size="sm" onClick={() => setShowEventDetails(false)}>
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Mini Calendar Widget (for sidebar)
interface MiniCalendarProps {
  events?: CalendarEventData[];
  onDateSelect?: (date: Date) => void;
  className?: string;
}

export function MiniCalendar({ events = [], onDateSelect, className }: MiniCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const hasEvents = useCallback((date: Date): boolean => {
    return events.some((event) => isSameDay(event.startDate, date));
  }, [events]);

  return (
    <Card className={className}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center">
          {weekDays.map((day) => (
            <div key={day} className="text-xs text-muted-foreground py-1">
              {day}
            </div>
          ))}
          {days.map((date, index) => {
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = isSameDay(date, today);
            const hasEvent = hasEvents(date);

            return (
              <button
                key={index}
                onClick={() => onDateSelect?.(date)}
                className={cn(
                  "text-xs p-1 rounded-full relative",
                  !isCurrentMonth && "text-muted-foreground/50",
                  isToday && "bg-primary text-primary-foreground",
                  !isToday && "hover:bg-accent"
                )}
              >
                {date.getDate()}
                {hasEvent && !isToday && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Upcoming Events Widget
interface UpcomingEventsProps {
  events?: CalendarEventData[];
  maxEvents?: number;
  className?: string;
  onEventClick?: (event: CalendarEventData) => void;
}

export function UpcomingEvents({ 
  events = [], 
  maxEvents = 5, 
  className,
  onEventClick 
}: UpcomingEventsProps) {
  const now = new Date();
  const upcomingEvents = events
    .filter((event) => event.startDate >= now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, maxEvents);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming events
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer"
              >
                <div className={cn(
                  "w-2 h-2 rounded-full mt-1.5 flex-shrink-0",
                  event.color || getEventColor(event.type)
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{event.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {event.startDate.toLocaleDateString()} • {formatTime(event.startDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
