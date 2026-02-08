"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PROFILE_PROMPTS, getPromptsByCategory, getPromptCategories } from "@/lib/prompts";
import { X, Edit2, Plus } from "lucide-react";

interface ProfilePrompt {
  promptId: string;
  question: string;
  answer: string;
}

interface PromptEditorProps {
  userPrompts?: ProfilePrompt[];
  onPromptsChange: (prompts: ProfilePrompt[]) => void;
  readOnly?: boolean;
  maxPrompts?: number;
}

export function PromptEditor({
  userPrompts = [],
  onPromptsChange,
  readOnly = false,
  maxPrompts = 5,
}: PromptEditorProps) {
  const [prompts, setPrompts] = useState<ProfilePrompt[]>(userPrompts);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [editingAnswer, setEditingAnswer] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("dating");

  useEffect(() => {
    setPrompts(userPrompts);
  }, [userPrompts]);

  const handleAddPrompt = (promptId: string) => {
    const existingPrompt = prompts.find((p) => p.promptId === promptId);
    if (existingPrompt || prompts.length >= maxPrompts) return;

    const promptData = PROFILE_PROMPTS.find((p) => p.id === promptId);
    if (!promptData) return;

    const newPrompts = [
      ...prompts,
      {
        promptId,
        question: promptData.question,
        answer: "",
      },
    ];

    setPrompts(newPrompts);
    onPromptsChange(newPrompts);
    setEditingPromptId(promptId);
  };

  const handleAnswerChange = (promptId: string, answer: string) => {
    const newPrompts = prompts.map((p) =>
      p.promptId === promptId ? { ...p, answer } : p
    );
    setPrompts(newPrompts);
    onPromptsChange(newPrompts);
  };

  const handleRemovePrompt = (promptId: string) => {
    const newPrompts = prompts.filter((p) => p.promptId !== promptId);
    setPrompts(newPrompts);
    onPromptsChange(newPrompts);
    if (editingPromptId === promptId) {
      setEditingPromptId(null);
    }
  };

  const answeredPromptIds = new Set(prompts.map((p) => p.promptId));
  const categories = getPromptCategories();

  if (readOnly) {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-sm">Profile Highlights</h3>
        {prompts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No prompts answered yet</p>
        ) : (
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <Card key={prompt.promptId} className="bg-secondary/50">
                <CardContent className="pt-4">
                  <p className="font-medium text-sm mb-2">{prompt.question}</p>
                  <p className="text-sm text-foreground/90">{prompt.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-sm mb-2">
          Profile Highlights ({prompts.length}/{maxPrompts})
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Answer prompts to showcase your personality and break the ice
        </p>
      </div>

      {/* Answered Prompts */}
      {prompts.length > 0 && (
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <Card key={prompt.promptId} className="bg-secondary/50">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-sm">{prompt.question}</p>
                  {!readOnly && (
                    <button
                      onClick={() => handleRemovePrompt(prompt.promptId)}
                      className="ml-2 hover:opacity-70"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {editingPromptId === prompt.promptId ? (
                  <div className="space-y-2">
                    <Textarea
                      value={prompt.answer}
                      onChange={(e) =>
                        handleAnswerChange(prompt.promptId, e.target.value)
                      }
                      placeholder="Your answer (10-500 characters)"
                      className="resize-none"
                      rows={3}
                    />
                    <Button
                      size="sm"
                      onClick={() => setEditingPromptId(null)}
                      disabled={prompt.answer.length < 10}
                    >
                      Done
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-foreground/90">
                      {prompt.answer || "No answer yet"}
                    </p>
                    {!readOnly && (
                      <button
                        onClick={() => {
                          setEditingPromptId(prompt.promptId);
                          setEditingAnswer(prompt.answer);
                        }}
                        className="ml-2 hover:opacity-70"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Prompt */}
      {prompts.length < maxPrompts && (
        <div>
          <h4 className="font-medium text-sm mb-2">Add a Prompt</h4>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              {categories.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className="capitalize text-xs"
                >
                  {category.replace("_", " ")}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category} value={category}>
                <div className="space-y-2">
                  {getPromptsByCategory(category).map((prompt) => {
                    const isAnswered = answeredPromptIds.has(prompt.id);
                    return (
                      <Button
                        key={prompt.id}
                        variant={isAnswered ? "secondary" : "outline"}
                        className="w-full justify-start h-auto py-2 px-3 text-left"
                        onClick={() => !isAnswered && handleAddPrompt(prompt.id)}
                        disabled={isAnswered}
                      >
                        <div className="flex items-start flex-1">
                          {isAnswered ? (
                            <>
                              <span className="mr-2 text-green-600">✓</span>
                              <span className="text-sm">{prompt.question}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 flex-shrink-0" size={16} />
                              <span className="text-sm">{prompt.question}</span>
                            </>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}
