"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface AvailabilitySlot {
  id: string;
  startDatetime: string;
  endDatetime: string;
  status: "open" | "requested" | "booked" | "completed";
}

interface AvailabilityCalendarProps {
  slots?: AvailabilitySlot[];
  onAddSlot?: (startTime: Date, endTime: Date) => Promise<void>;
  onRemoveSlot?: (slotId: string) => Promise<void>;
  isEditable?: boolean;
}

/**
 * AvailabilityCalendar Component
 * Displays user's available date slots in calendar format
 * Allows adding new availability windows
 */
export function AvailabilityCalendar({
  slots = [],
  onAddSlot,
  onRemoveSlot,
  isEditable = false,
}: AvailabilityCalendarProps) {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showAddForm, setShowAddForm] = useState(false);

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = new Date(slot.startDatetime).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  // Get slots for selected date
  const selectedDateSlots = slotsByDate[selectedDate.toDateString()] || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100";
      case "requested":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100";
      case "booked":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100";
      case "completed":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  const handleAddSlot = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const startTime = new Date(formData.get("startTime") as string);
      const endTime = new Date(formData.get("endTime") as string);

      if (onAddSlot) {
        await onAddSlot(startTime, endTime);
      }

      setShowAddForm(false);
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error adding availability slot:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSlot = async (slotId: string) => {
    if (!onRemoveSlot) return;

    setLoading(true);
    try {
      await onRemoveSlot(slotId);
    } catch (error) {
      console.error("Error removing availability slot:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Availability Calendar</h2>
        </div>
        {isEditable && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            variant={showAddForm ? "default" : "outline"}
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Slot
          </Button>
        )}
      </div>

      {/* Add Slot Form */}
      {showAddForm && isEditable && (
        <Card className="p-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <form onSubmit={handleAddSlot} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="endTime"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? "Adding..." : "Add Slot"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Mini Calendar */}
      <Card className="p-4">
        <div className="space-y-3">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-gray-600 dark:text-gray-400">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {/* Calendar days would be rendered here */}
            <div className="text-center p-2 text-sm">1</div>
            <div className="text-center p-2 text-sm font-bold text-blue-600">
              {selectedDate.getDate()}
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </Card>

      {/* Slots List */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">
          {selectedDate.toDateString()} ({selectedDateSlots.length} slots)
        </h3>

        {selectedDateSlots.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No available slots for this date
          </p>
        ) : (
          <div className="space-y-2">
            {selectedDateSlots.map((slot) => {
              const start = new Date(slot.startDatetime);
              const end = new Date(slot.endDatetime);

              return (
                <div
                  key={slot.id}
                  className={`p-3 rounded-lg flex items-center justify-between ${getStatusColor(
                    slot.status
                  )}`}
                >
                  <div>
                    <div className="font-medium text-sm">
                      {start.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {end.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="text-xs opacity-75">
                      Status: {slot.status}
                    </div>
                  </div>

                  {isEditable && slot.status === "open" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveSlot(slot.id)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Summary */}
      {slots.length > 0 && (
        <Card className="p-4 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            <div>
              <div className="font-semibold">
                {slots.filter((s) => s.status === "open").length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Open</div>
            </div>
            <div>
              <div className="font-semibold">
                {slots.filter((s) => s.status === "requested").length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Requested</div>
            </div>
            <div>
              <div className="font-semibold">
                {slots.filter((s) => s.status === "booked").length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Booked</div>
            </div>
            <div>
              <div className="font-semibold">
                {slots.filter((s) => s.status === "completed").length}
              </div>
              <div className="text-gray-600 dark:text-gray-400">Completed</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
