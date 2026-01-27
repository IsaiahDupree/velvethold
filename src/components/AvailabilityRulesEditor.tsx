"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AvailabilityRule {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

interface AvailabilityRulesEditorProps {
  initialRules?: AvailabilityRule[];
  onChange: (rules: AvailabilityRule[]) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

// Generate time options in 30-minute intervals
const generateTimeOptions = () => {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      options.push(`${h}:${m}`);
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

export function AvailabilityRulesEditor({
  initialRules = [],
  onChange,
}: AvailabilityRulesEditorProps) {
  const [rules, setRules] = useState<AvailabilityRule[]>(initialRules);

  const addRule = () => {
    const newRule: AvailabilityRule = {
      dayOfWeek: 1, // Monday by default
      startTime: "09:00",
      endTime: "17:00",
      active: true,
    };
    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    onChange(updatedRules);
  };

  const removeRule = (index: number) => {
    const updatedRules = rules.filter((_, i) => i !== index);
    setRules(updatedRules);
    onChange(updatedRules);
  };

  const updateRule = (
    index: number,
    field: keyof AvailabilityRule,
    value: number | string | boolean
  ) => {
    const updatedRules = rules.map((rule, i) => {
      if (i === index) {
        return { ...rule, [field]: value };
      }
      return rule;
    });
    setRules(updatedRules);
    onChange(updatedRules);
  };

  const toggleRule = (index: number) => {
    const updatedRules = rules.map((rule, i) => {
      if (i === index) {
        return { ...rule, active: !rule.active };
      }
      return rule;
    });
    setRules(updatedRules);
    onChange(updatedRules);
  };

  // Group rules by day of week for better display
  const rulesByDay = DAYS_OF_WEEK.map(day => ({
    ...day,
    rules: rules
      .map((rule, index) => ({ ...rule, index }))
      .filter(rule => rule.dayOfWeek === day.value),
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Availability Schedule
          </CardTitle>
          <CardDescription>
            Set your weekly availability. You can add multiple time slots per day.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display rules grouped by day */}
          <div className="space-y-3">
            {rulesByDay.map(day => (
              <div key={day.value} className="border rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{day.label}</h4>
                  {day.rules.length > 0 && (
                    <Badge variant="secondary">{day.rules.length} slot{day.rules.length !== 1 ? 's' : ''}</Badge>
                  )}
                </div>

                {day.rules.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Not available</p>
                ) : (
                  <div className="space-y-2">
                    {day.rules.map(rule => (
                      <div
                        key={rule.index}
                        className={`flex items-center gap-2 p-2 rounded ${
                          rule.active ? "bg-primary/5" : "bg-muted/50 opacity-60"
                        }`}
                      >
                        <div className="flex-1 flex items-center gap-2">
                          <Select
                            value={rule.startTime}
                            onValueChange={(value) =>
                              updateRule(rule.index, "startTime", value)
                            }
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map(time => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <span className="text-muted-foreground">to</span>

                          <Select
                            value={rule.endTime}
                            onValueChange={(value) =>
                              updateRule(rule.index, "endTime", value)
                            }
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_OPTIONS.map(time => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          variant={rule.active ? "outline" : "secondary"}
                          size="sm"
                          onClick={() => toggleRule(rule.index)}
                        >
                          {rule.active ? "Active" : "Inactive"}
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeRule(rule.index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add new rule */}
          <div className="border-t pt-4">
            <Button onClick={addRule} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Time Slot
            </Button>
          </div>

          {/* Quick add presets */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Quick Presets:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Add weekday evenings (Mon-Fri 18:00-22:00)
                  const newRules = [1, 2, 3, 4, 5].map(day => ({
                    dayOfWeek: day,
                    startTime: "18:00",
                    endTime: "22:00",
                    active: true,
                  }));
                  const updatedRules = [...rules, ...newRules];
                  setRules(updatedRules);
                  onChange(updatedRules);
                }}
              >
                Weekday Evenings
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Add weekend afternoons (Sat-Sun 14:00-20:00)
                  const newRules = [0, 6].map(day => ({
                    dayOfWeek: day,
                    startTime: "14:00",
                    endTime: "20:00",
                    active: true,
                  }));
                  const updatedRules = [...rules, ...newRules];
                  setRules(updatedRules);
                  onChange(updatedRules);
                }}
              >
                Weekend Afternoons
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRules([]);
                  onChange([]);
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You have {rules.filter(r => r.active).length} active time slot{rules.filter(r => r.active).length !== 1 ? 's' : ''}
              {rules.filter(r => !r.active).length > 0 && (
                <span> and {rules.filter(r => !r.active).length} inactive</span>
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
