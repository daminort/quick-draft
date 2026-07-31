# Quick Draft

Quick Draft is a lightweight, browser-based 2D vector drawing editor for sketching precise
drawings and diagrams — a CAD-lite tool built with React, TypeScript, and Konva.

## Features

- **Drawing tools** — line, rectangle, circle, arc, and text, plus guides and dimension lines
  bound to shape geometry for precise measurements
- **Selection & transform** — select shapes and resize/rotate them via an on-canvas selection
  frame
- **Snapping & rulers** — snap while drawing and dragging, with a ruler tool for quick
  measurements
- **Component library** — group shapes into reusable components and place instances across a
  drawing
- **Undo/redo** — full history of document changes
- **Copy & paste** — duplicate shapes within a drawing
- **Print view** and **SVG export** for sharing or printing finished drawings
- **Import/export** — save and load documents and component libraries as JSON
- **Properties panels** — per-shape settings panels and configurable measurement units

## Tech Stack

- React 19 + TypeScript
- Vite
- Konva / react-konva
- Zustand + zundo (state management with undo/redo)
- Radix UI

## License

This project is licensed under the [MIT License](./LICENSE).
