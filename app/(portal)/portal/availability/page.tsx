"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Copy,
  ExternalLink,
  Settings,
  Users,
  CalendarDays,
  CalendarX,
  Save,
  Eye,
  Link as LinkIcon,
  CheckCircle,
  XCircle,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type WeeklySchedule,
  type MeetingType,
  type DateOverride,
  type TimeSlot,
  type Booking,
  DEFAULT_WEEKLY_SCHEDULE,
  TIMEZONES,
  DURATION_OPTIONS,
  TIME_SLOTS,
  formatTime,
} from "@/lib/types/availability";

const DAYS_OF_WEEK = [
  { key: "sunday", label: "Sunday", short: "Sun" },
  { key: "monday", label: "Monday", short: "Mon" },
  { key: "tuesday", label: "Tuesday", short: "Tue" },
  { key: "wednesday", label: "Wednesday", short: "Wed" },
  { key: "thursday", label: "Thursday", short: "Thu" },
  { key: "friday", label: "Friday", short: "Fri" },
  { key: "saturday", label: "Saturday", short: "Sat" },
] as const;

// Sample meeting types
const sampleMeetingTypes: MeetingType[] = [
  {
    id: "1",
    name: "Discovery/Scoping Session",
    description: "60-minute complimentary session to explore your goals and specific V+ solutions",
    duration: 60,
    color: "#C8A951",
    bufferBefore: 0,
    bufferAfter: 15,
    isActive: true,
    requiresApproval: false,
  },
  {
    id: "2",
    name: "Quick Consultation",
    description: "30-minute focused discussion on a specific topic",
    duration: 30,
    color: "#3b82f6",
    bufferBefore: 0,
    bufferAfter: 10,
    isActive: true,
    requiresApproval: false,
  },
  {
    id: "3",
    name: "Strategy Session",
    description: "90-minute deep dive into strategic planning",
    duration: 90,
    color: "#8b5cf6",
    bufferBefore: 15,
    bufferAfter: 15,
    isActive: false,
    requiresApproval: true,
  },
];

// Sample bookings
const sampleBookings: Booking[] = [
  {
    id: "b1",
    meetingTypeId: "1",
    meetingTypeName: "Discovery/Scoping Session",
    ownerId: "owner1",
    ownerName: "Brian Stitt",
    guestName: "John Smith",
    guestEmail: "john@example.com",
    date: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    endTime: "11:00",
    timezone: "America/New_York",
    status: "confirmed",
    createdAt: new Date().toISOString(),
  },
];

export default function AvailabilityPage() {
  const [timezone, setTimezone] = useState("America/New_York");
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>(DEFAULT_WEEKLY_SCHEDULE);
  const [meetingTypes, setMeetingTypes] = useState<MeetingType[]>(sampleMeetingTypes);
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);
  const [isAddMeetingTypeOpen, setIsAddMeetingTypeOpen] = useState(false);
  const [isAddOverrideOpen, setIsAddOverrideOpen] = useState(false);
  const [editingMeetingType, setEditingMeetingType] = useState<MeetingType | null>(null);
  const [newMeetingType, setNewMeetingType] = useState<Partial<MeetingType>>({
    name: "",
    description: "",
    duration: 60,
    color: "#C8A951",
    bufferBefore: 0,
    bufferAfter: 15,
    isActive: true,
    requiresApproval: false,
  });
  const [newOverride, setNewOverride] = useState<Partial<DateOverride>>({
    date: "",
    type: "unavailable",
    reason: "",
  });

  const toggleDayEnabled = (day: keyof WeeklySchedule) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const updateDaySlot = (day: keyof WeeklySchedule, slotIndex: number, field: "start" | "end", value: string) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) =>
          i === slotIndex ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const addSlotToDay = (day: keyof WeeklySchedule) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { start: "09:00", end: "17:00" }],
      },
    }));
  };

  const removeSlotFromDay = (day: keyof WeeklySchedule, slotIndex: number) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== slotIndex),
      },
    }));
  };

  const saveMeetingType = () => {
    if (!newMeetingType.name) return;
    
    if (editingMeetingType) {
      setMeetingTypes((prev) =>
        prev.map((mt) =>
          mt.id === editingMeetingType.id ? { ...mt, ...newMeetingType } as MeetingType : mt
        )
      );
    } else {
      const newType: MeetingType = {
        ...newMeetingType,
        id: `mt-${Date.now()}`,
      } as MeetingType;
      setMeetingTypes((prev) => [...prev, newType]);
    }
    
    setIsAddMeetingTypeOpen(false);
    setEditingMeetingType(null);
    setNewMeetingType({
      name: "",
      description: "",
      duration: 60,
      color: "#C8A951",
      bufferBefore: 0,
      bufferAfter: 15,
      isActive: true,
      requiresApproval: false,
    });
  };

  const deleteMeetingType = (id: string) => {
    setMeetingTypes((prev) => prev.filter((mt) => mt.id !== id));
  };

  const addDateOverride = () => {
    if (!newOverride.date) return;
    
    const override: DateOverride = {
      id: `override-${Date.now()}`,
      date: newOverride.date,
      type: newOverride.type || "unavailable",
      reason: newOverride.reason,
    };
    
    setDateOverrides((prev) => [...prev, override]);
    setIsAddOverrideOpen(false);
    setNewOverride({ date: "", type: "unavailable", reason: "" });
  };

  const removeDateOverride = (id: string) => {
    setDateOverrides((prev) => prev.filter((o) => o.id !== id));
  };

  const copyBookingLink = (meetingTypeId: string) => {
    const link = `${window.location.origin}/book/${meetingTypeId}`;
    navigator.clipboard.writeText(link);
    alert("Booking link copied to clipboard!");
  };

  const updateBookingStatus = (bookingId: string, status: Booking["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
    );
  };

  // Stats
  const activeMeetingTypes = meetingTypes.filter((mt) => mt.isActive).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CalendarDays className="h-8 w-8" />
            Availability Management
          </h1>
          <p className="text-muted-foreground">
            Set your availability and manage meeting types for scheduling
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meeting Types</p>
                <p className="text-2xl font-bold">{activeMeetingTypes}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingBookings}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">{confirmedBookings}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Date Overrides</p>
                <p className="text-2xl font-bold">{dateOverrides.length}</p>
              </div>
              <CalendarX className="h-8 w-8 text-muted-foreground/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="meeting-types">Meeting Types</TabsTrigger>
          <TabsTrigger value="overrides">Date Overrides</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        {/* Weekly Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Weekly Availability</CardTitle>
                  <CardDescription>Set your regular working hours for each day of the week</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Timezone:</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {DAYS_OF_WEEK.map(({ key, label }) => {
                  const day = weeklySchedule[key as keyof WeeklySchedule];
                  return (
                    <div key={key} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-3 w-32">
                        <Switch
                          checked={day.enabled}
                          onCheckedChange={() => toggleDayEnabled(key as keyof WeeklySchedule)}
                        />
                        <span className={cn("font-medium", !day.enabled && "text-muted-foreground")}>
                          {label}
                        </span>
                      </div>
                      
                      {day.enabled ? (
                        <div className="flex-1 space-y-2">
                          {day.slots.map((slot, slotIndex) => (
                            <div key={slotIndex} className="flex items-center gap-2">
                              <Select
                                value={slot.start}
                                onValueChange={(v) => updateDaySlot(key as keyof WeeklySchedule, slotIndex, "start", v)}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {formatTime(time)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <span className="text-muted-foreground">to</span>
                              <Select
                                value={slot.end}
                                onValueChange={(v) => updateDaySlot(key as keyof WeeklySchedule, slotIndex, "end", v)}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map((time) => (
                                    <SelectItem key={time} value={time}>
                                      {formatTime(time)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {day.slots.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeSlotFromDay(key as keyof WeeklySchedule, slotIndex)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          ))}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addSlotToDay(key as keyof WeeklySchedule)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add time slot
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unavailable</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Meeting Types Tab */}
        <TabsContent value="meeting-types" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Meeting Types</h3>
              <p className="text-sm text-muted-foreground">Create different types of meetings with custom durations</p>
            </div>
            <Button onClick={() => setIsAddMeetingTypeOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Meeting Type
            </Button>
          </div>

          <div className="grid gap-4">
            {meetingTypes.map((mt) => (
              <Card key={mt.id} className={cn(!mt.isActive && "opacity-60")}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-4 h-full min-h-[60px] rounded"
                        style={{ backgroundColor: mt.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{mt.name}</h4>
                          {!mt.isActive && <Badge variant="secondary">Inactive</Badge>}
                          {mt.requiresApproval && <Badge variant="outline">Requires Approval</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{mt.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {mt.duration} minutes
                          </span>
                          {(mt.bufferBefore > 0 || mt.bufferAfter > 0) && (
                            <span>
                              Buffer: {mt.bufferBefore}m before, {mt.bufferAfter}m after
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyBookingLink(mt.id)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingMeetingType(mt);
                          setNewMeetingType(mt);
                          setIsAddMeetingTypeOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMeetingType(mt.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Date Overrides Tab */}
        <TabsContent value="overrides" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Date Overrides</h3>
              <p className="text-sm text-muted-foreground">Block specific dates or set custom hours</p>
            </div>
            <Button onClick={() => setIsAddOverrideOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Override
            </Button>
          </div>

          {dateOverrides.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <CalendarX className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No date overrides set</p>
                <p className="text-sm text-muted-foreground">Add overrides for holidays, vacations, or special hours</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dateOverrides.map((override) => (
                      <TableRow key={override.id}>
                        <TableCell className="font-medium">
                          {new Date(override.date + "T00:00:00").toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={override.type === "unavailable" ? "destructive" : "secondary"}>
                            {override.type === "unavailable" ? "Unavailable" : "Custom Hours"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {override.reason || "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeDateOverride(override.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Upcoming Bookings</h3>
              <p className="text-sm text-muted-foreground">Manage your scheduled meetings</p>
            </div>
          </div>

          {bookings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No bookings yet</p>
                <p className="text-sm text-muted-foreground">Share your booking link to start receiving appointments</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Meeting Type</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{booking.guestName}</p>
                            <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{booking.meetingTypeName}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {new Date(booking.date + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "pending"
                                ? "secondary"
                                : booking.status === "cancelled"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {booking.status === "pending" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateBookingStatus(booking.id, "confirmed")}
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => updateBookingStatus(booking.id, "cancelled")}
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            {booking.status === "confirmed" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => updateBookingStatus(booking.id, "cancelled")}
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Meeting Type Dialog */}
      <Dialog open={isAddMeetingTypeOpen} onOpenChange={setIsAddMeetingTypeOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingMeetingType ? "Edit Meeting Type" : "Add Meeting Type"}</DialogTitle>
            <DialogDescription>
              Create a new type of meeting that guests can book
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="e.g., Discovery Call"
                value={newMeetingType.name || ""}
                onChange={(e) => setNewMeetingType({ ...newMeetingType, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what this meeting is about..."
                value={newMeetingType.description || ""}
                onChange={(e) => setNewMeetingType({ ...newMeetingType, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={newMeetingType.duration?.toString()}
                  onValueChange={(v) => setNewMeetingType({ ...newMeetingType, duration: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newMeetingType.color || "#C8A951"}
                    onChange={(e) => setNewMeetingType({ ...newMeetingType, color: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={newMeetingType.color || "#C8A951"}
                    onChange={(e) => setNewMeetingType({ ...newMeetingType, color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buffer Before (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  value={newMeetingType.bufferBefore || 0}
                  onChange={(e) => setNewMeetingType({ ...newMeetingType, bufferBefore: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Buffer After (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  value={newMeetingType.bufferAfter || 0}
                  onChange={(e) => setNewMeetingType({ ...newMeetingType, bufferAfter: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={newMeetingType.isActive}
                  onCheckedChange={(v) => setNewMeetingType({ ...newMeetingType, isActive: v })}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={newMeetingType.requiresApproval}
                  onCheckedChange={(v) => setNewMeetingType({ ...newMeetingType, requiresApproval: v })}
                />
                <Label>Requires Approval</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddMeetingTypeOpen(false);
              setEditingMeetingType(null);
            }}>
              Cancel
            </Button>
            <Button onClick={saveMeetingType} disabled={!newMeetingType.name}>
              {editingMeetingType ? "Save Changes" : "Add Meeting Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Date Override Dialog */}
      <Dialog open={isAddOverrideOpen} onOpenChange={setIsAddOverrideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Date Override</DialogTitle>
            <DialogDescription>
              Block a specific date or set custom hours
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Input
                type="date"
                value={newOverride.date || ""}
                onChange={(e) => setNewOverride({ ...newOverride, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={newOverride.type}
                onValueChange={(v) => setNewOverride({ ...newOverride, type: v as "unavailable" | "custom" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unavailable">Unavailable (entire day)</SelectItem>
                  <SelectItem value="custom">Custom Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reason (optional)</Label>
              <Input
                placeholder="e.g., Holiday, Vacation, etc."
                value={newOverride.reason || ""}
                onChange={(e) => setNewOverride({ ...newOverride, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOverrideOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addDateOverride} disabled={!newOverride.date}>
              Add Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
