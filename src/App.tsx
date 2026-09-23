/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { OcrUploadZone } from './components/OcrUploadZone';
import { TextareaEditor } from './components/TextareaEditor';
import { EventsManager } from './components/EventsManager';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ScheduleEvent, GraphicSettings, OcrStatus } from './types';
import { INITIAL_EVENTS, EXAMPLE_EVENTS, eventsToText, parseScheduleText } from './utils/parser';
import { Eye, Edit3 } from 'lucide-react';

export default function App() {
  const [events, setEvents] = useState<ScheduleEvent[]>(INITIAL_EVENTS);
  const [rawText, setRawText] = useState<string>(eventsToText(INITIAL_EVENTS));
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  const [settings, setSettings] = useState<GraphicSettings>({
    density: 'auto',
    badgeStyle: 'solid',
    showDivider: true,
  });

  const [ocrStatus, setOcrStatus] = useState<OcrStatus>({
    isProcessing: false,
    stage: '',
    progress: 0,
    fileCount: 0,
    currentFileIndex: 0,
    error: null,
  });

  // Called when OCR extracts text from one or more screenshots
  const handleTextExtracted = useCallback((extracted: string) => {
    setRawText(extracted);
    const parsed = parseScheduleText(extracted);
    if (parsed.length > 0) {
      setEvents(parsed);
    }
  }, []);

  // Called when user types or edits raw text
  const handleParseText = useCallback((text: string) => {
    const parsed = parseScheduleText(text);
    if (parsed.length > 0) {
      setEvents(parsed);
    }
  }, []);

  // Re-generate raw text from current event cards
  const handleSyncFromEvents = useCallback(() => {
    const formatted = eventsToText(events);
    setRawText(formatted);
  }, [events]);

  // Update a single field in an event
  const handleUpdateEvent = useCallback(
    (id: string, field: keyof ScheduleEvent, value: string) => {
      setEvents((prev) =>
        prev.map((evt) => (evt.id === id ? { ...evt, [field]: value } : evt))
      );
    },
    []
  );

  // Add a new blank or templated event
  const handleAddEvent = useCallback(() => {
    const newEvent: ScheduleEvent = {
      id: `evt-${Date.now()}`,
      category: 'Amichevole 2018 2019 U9',
      badge: 'AMICHEVOLE',
      match: 'ASD Gravellona San Pietro - USD Ornavassese',
      date: 'SABATO 26 SETTEMBRE 2026 (14:00 - 15:30)',
      location: 'Corso Sempione 200 - 28883 Gravellona Toce VB',
    };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  // Remove event
  const handleRemoveEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((evt) => evt.id !== id));
  }, []);

  // Move event up/down
  const handleMoveEvent = useCallback((index: number, direction: 'up' | 'down') => {
    setEvents((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  }, []);

  // Duplicate an event
  const handleDuplicateEvent = useCallback((id: string) => {
    setEvents((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx === -1) return prev;
      const original = prev[idx];
      const clone: ScheduleEvent = {
        ...original,
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        category: `${original.category} (Copia)`,
      };
      const updated = [...prev];
      updated.splice(idx + 1, 0, clone);
      return updated;
    });
  }, []);

  // Load realistic preset
  const handleLoadExample = useCallback(() => {
    const sample = EXAMPLE_EVENTS && EXAMPLE_EVENTS.length > 0 ? EXAMPLE_EVENTS : INITIAL_EVENTS;
    setEvents(sample);
    setRawText(eventsToText(sample));
  }, []);

  // Clear all
  const handleClearAll = useCallback(() => {
    setEvents([]);
    setRawText('');
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        onLoadExample={handleLoadExample}
        onClearAll={handleClearAll}
        hasEvents={events.length > 0}
      />

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden bg-neutral-900 border-b border-neutral-800 px-4 py-2 flex items-center justify-center gap-2 sticky top-[57px] z-30">
        <button
          type="button"
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
            mobileTab === 'editor'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'bg-neutral-800 text-neutral-300'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Dati & OCR ({events.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
            mobileTab === 'preview'
              ? 'bg-amber-400 text-black shadow-sm'
              : 'bg-neutral-800 text-neutral-300'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Anteprima 4:5</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: OCR + Textarea + Structured Event Cards */}
          <div
            className={`lg:col-span-7 space-y-6 ${
              mobileTab === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* 1. OCR Upload */}
            <OcrUploadZone
              onTextExtracted={handleTextExtracted}
              ocrStatus={ocrStatus}
              setOcrStatus={setOcrStatus}
            />

            {/* 2. Textarea */}
            <TextareaEditor
              rawText={rawText}
              setRawText={setRawText}
              onParseText={handleParseText}
              onSyncFromEvents={handleSyncFromEvents}
              eventsCount={events.length}
            />

            {/* 3. Structured Events Manager */}
            <EventsManager
              events={events}
              onUpdateEvent={handleUpdateEvent}
              onAddEvent={handleAddEvent}
              onRemoveEvent={handleRemoveEvent}
              onMoveEvent={handleMoveEvent}
              onDuplicateEvent={handleDuplicateEvent}
            />
          </div>

          {/* Right Column: Sticky Preview & Export Canvas */}
          <div
            className={`lg:col-span-5 lg:sticky lg:top-[74px] ${
              mobileTab === 'editor' ? 'hidden lg:block' : 'block'
            }`}
          >
            <PreviewCanvas
              events={events}
              settings={settings}
              setSettings={setSettings}
            />
          </div>
        </div>
      </main>

      {/* Subdued footer with USD Ornavassese club identification */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-4 px-4 text-center text-xs text-neutral-400">
        <p>USD Ornavassese 1946 • Generatore Ufficiale Locandine Social 4:5 (1080×1350 px)</p>
      </footer>
    </div>
  );
}
