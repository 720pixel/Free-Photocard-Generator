"use client";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import Konva from "konva";
import { Layer as KLayer, Rect, Stage as KStage, Transformer } from "react-konva";
import { useEditor } from "../store";
import { docDimensions, type EditorDoc, type Layer, type ShapeLayer } from "../types";
import { presetByKey } from "@/lib/presets";
import { fillProps } from "./fills";
import { ImageNode, ShapeNode, TextNode } from "./nodes";
import { computeSnap } from "../snap";
import { ensureFontsReady } from "../fonts";

export interface StageHandle {
  stage: () => Konva.Stage | null;
  exportBlob: (opts: { w: number; h: number; format: "png" | "jpeg"; quality: number }) => Promise<Blob>;
}

interface Props {
  displayW: number;
  displayH: number;
  interactive?: boolean;
  onRequestTextEdit?: (id: string) => void;
  // Render an arbitrary document instead of the live store doc (used by the
  // generator to rasterise candidate designs off-screen). Implies non-interactive.
  docOverride?: EditorDoc;
}

export const EditorStage = forwardRef<StageHandle, Props>(function EditorStage(
  { displayW, displayH, interactive = true, onRequestTextEdit, docOverride },
  ref,
) {
  const storeDoc = useEditor((s) => s.doc);
  const doc = docOverride ?? storeDoc;
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const updateLayer = useEditor((s) => s.updateLayer);
  const setPositions = useEditor((s) => s.setPositions);
  const catchIntoFrame = useEditor((s) => s.catchIntoFrame);
  const freeMode = useEditor((s) => s.freeMode);
  const retouchActive = useEditor((s) => s.retouchActive);
  const retouchTool = useEditor((s) => s.retouchTool);
  const retouchBrush = useEditor((s) => s.retouchBrush);
  const addRetouchStroke = useEditor((s) => s.addRetouchStroke);
  const addRetouchRegion = useEditor((s) => s.addRetouchRegion);

  const drawing = useRef<{ pts: number[]; start: { x: number; y: number } | null } | null>(null);

  // Empty image/logo slot (a "frame") under a canvas point, topmost first,
  // excluding the layer being dragged. Used for Canva-style catch-into-frame.
  const frameAt = (px: number, py: number, excludeId: string) => {
    for (let i = doc.layers.length - 1; i >= 0; i--) {
      const l = doc.layers[i];
      if (l.id === excludeId || !l.visible) continue;
      if ((l.type === "image" || l.type === "logo") && !l.src) {
        if (px >= l.x && px <= l.x + l.width && py >= l.y && py <= l.y + l.height) return l;
      }
    }
    return null;
  };

  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const nodeRefs = useRef<Map<string, Konva.Node>>(new Map());
  const guideRef = useRef<Konva.Layer>(null);

  const { w, h } = docDimensions(doc, presetByKey);
  const scale = Math.min(displayW / w, displayH / h);

  // Konva rasterizes text once; if a webfont finishes loading after that first
  // draw, glyphs stay as fallback (tofu) until a redraw. Load the fonts in use
  // and force a redraw so Bengali/latin text always renders correctly.
  useEffect(() => {
    const fams = new Set<string>(["Hind Siliguri"]);
    for (const l of doc.layers) if (l.type === "text") fams.add(l.fontFamily);
    let cancelled = false;
    const redraw = () => {
      if (cancelled) return;
      const stage = stageRef.current;
      if (!stage) return;
      // re-cache filtered images and redraw all layers
      stage.getLayers().forEach((ly) => ly.batchDraw());
    };
    void ensureFontsReady([...fams]).then(redraw);
    const onDone = () => redraw();
    document.fonts?.addEventListener?.("loadingdone", onDone);
    return () => {
      cancelled = true;
      document.fonts?.removeEventListener?.("loadingdone", onDone);
    };
  }, [doc.layers]);

  // Layers that move/resize together with the given id (a collage group).
  const groupSiblings = (id: string | null) => {
    if (!id) return [];
    const l = doc.layers.find((x) => x.id === id);
    if (!l?.groupId) return l ? [l] : [];
    return doc.layers.filter((x) => x.groupId === l.groupId);
  };

  // attach transformer to the selected node (or its whole group)
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const sibs = groupSiblings(selectedId);
    const nodes = sibs.map((l) => nodeRefs.current.get(l.id)).filter(Boolean) as Konva.Node[];
    const single = selectedId ? nodeRefs.current.get(selectedId) : null;
    tr.nodes(nodes.length ? nodes : single ? [single] : []);
    tr.getLayer()?.batchDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, doc.layers]);

  useImperativeHandle(ref, () => ({
    stage: () => stageRef.current,
    exportBlob: async ({ w: tw, h: th, format, quality }) => {
      const stage = stageRef.current!;
      // deselect so transformer handles do not appear in export
      const prev = selectedId;
      select(null);
      const tr = trRef.current;
      tr?.nodes([]);
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const pixelRatio = tw / (w * scale);
      const canvas = stage.toCanvas({ pixelRatio });
      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b!), format === "png" ? "image/png" : "image/jpeg", quality),
      );
      if (prev) select(prev);
      return blob;
    },
  }));

  const bgFill = useMemo(() => fillProps(doc.background, w, h), [doc.background, w, h]);

  const setRef = (id: string) => (node: Konva.Node | null) => {
    if (node) nodeRefs.current.set(id, node);
    else nodeRefs.current.delete(id);
  };

  const isEditable = (l: Layer) => interactive && !l.locked; // all layer types are selectable/movable
  // While retouching the selected photo, freeze its drag so brush strokes land.
  const isDraggable = (l: Layer) => isEditable(l) && !(retouchActive && l.id === selectedId && (l.type === "image" || l.type === "logo"));

  const drawGuides = (vLines: number[], hLines: number[]) => {
    const layer = guideRef.current;
    if (!layer) return;
    layer.destroyChildren();
    const stroke = "#e8462b";
    for (const x of vLines) {
      layer.add(new Konva.Line({ points: [x, 0, x, h], stroke, strokeWidth: 1 / scale, dash: [6 / scale, 4 / scale], listening: false }));
    }
    for (const y of hLines) {
      layer.add(new Konva.Line({ points: [0, y, w, y], stroke, strokeWidth: 1 / scale, dash: [6 / scale, 4 / scale], listening: false }));
    }
    layer.batchDraw();
  };
  const clearGuides = () => {
    const layer = guideRef.current;
    if (layer) {
      layer.destroyChildren();
      layer.batchDraw();
    }
  };

  const highlightFrame = (l: Layer) => {
    const layer = guideRef.current;
    if (!layer) return;
    layer.add(
      new Konva.Rect({
        x: l.x,
        y: l.y,
        width: l.width,
        height: l.height,
        stroke: "#16a34a",
        strokeWidth: 3 / scale,
        dash: [10 / scale, 6 / scale],
        listening: false,
      }),
    );
    layer.batchDraw();
  };

  // A dragged photo (has src) can be caught by an empty frame under its centre.
  const canCatch = (l: Layer) => (l.type === "image" || l.type === "logo") && !!l.src;

  const onDragMove = (l: Layer) => (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    // Grouped layers (collages) move as one: no snap, drag siblings by delta.
    if (l.groupId) {
      const dx = node.x() - l.x;
      const dy = node.y() - l.y;
      for (const sib of doc.layers) {
        if (sib.groupId !== l.groupId || sib.id === l.id) continue;
        nodeRefs.current.get(sib.id)?.position({ x: sib.x + dx, y: sib.y + dy });
      }
      node.getLayer()?.batchDraw();
      return;
    }
    if (!freeMode) {
      const box = { x: node.x(), y: node.y(), width: l.width, height: l.height };
      const snap = computeSnap(box, doc.layers, l.id, w, h, 7 / scale);
      node.position({ x: snap.x, y: snap.y });
      drawGuides(snap.vLines, snap.hLines);
    }
    if (canCatch(l)) {
      const target = frameAt(node.x() + l.width / 2, node.y() + l.height / 2, l.id);
      if (target) highlightFrame(target);
    }
  };

  const onDragEnd = (l: Layer) => (e: Konva.KonvaEventObject<DragEvent>) => {
    clearGuides();
    const nx = e.target.x();
    const ny = e.target.y();
    if (l.groupId) {
      const dx = nx - l.x;
      const dy = ny - l.y;
      const pos: Record<string, { x: number; y: number }> = {};
      for (const sib of doc.layers) {
        if (sib.groupId === l.groupId) pos[sib.id] = { x: sib.x + dx, y: sib.y + dy };
      }
      setPositions(pos);
      return;
    }
    if (canCatch(l)) {
      const target = frameAt(nx + l.width / 2, ny + l.height / 2, l.id);
      if (target) {
        catchIntoFrame(l.id, target.id);
        return;
      }
    }
    updateLayer(l.id, { x: nx, y: ny });
  };

  const onTransformEnd = (l: Layer) => (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const sx = node.scaleX();
    const sy = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    updateLayer(l.id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(20, l.width * sx),
      height: Math.max(20, l.height * sy),
      rotation: node.rotation(),
    });
  };

  const retouchTarget =
    retouchActive && selectedId ? doc.layers.find((l) => l.id === selectedId && (l.type === "image" || l.type === "logo")) : undefined;

  const localPoint = () => {
    if (!retouchTarget) return null;
    const node = nodeRefs.current.get(retouchTarget.id) as Konva.Group | undefined;
    const p = node?.getRelativePointerPosition();
    if (!p) return null;
    return { x: Math.max(0, Math.min(retouchTarget.width, p.x)), y: Math.max(0, Math.min(retouchTarget.height, p.y)) };
  };

  const previewBrush = (pts: number[]) => {
    const layer = guideRef.current;
    if (!layer || !retouchTarget) return;
    layer.destroyChildren();
    for (let i = 0; i < pts.length; i += 2) {
      layer.add(new Konva.Circle({ x: retouchTarget.x + pts[i], y: retouchTarget.y + pts[i + 1], radius: retouchBrush / 2, fill: "rgba(225,29,42,0.28)", listening: false }));
    }
    layer.batchDraw();
  };
  const previewRegion = (start: { x: number; y: number }, cur: { x: number; y: number }) => {
    const layer = guideRef.current;
    if (!layer || !retouchTarget) return;
    layer.destroyChildren();
    const x = retouchTarget.x + Math.min(start.x, cur.x);
    const y = retouchTarget.y + Math.min(start.y, cur.y);
    const rw = Math.abs(cur.x - start.x);
    const rh = Math.abs(cur.y - start.y);
    const common = { fill: "rgba(225,29,42,0.28)", stroke: "#e11d2a", strokeWidth: 1.5 / scale, listening: false };
    if (retouchTool === "circle") layer.add(new Konva.Ellipse({ x: x + rw / 2, y: y + rh / 2, radiusX: rw / 2, radiusY: rh / 2, ...common }));
    else layer.add(new Konva.Rect({ x, y, width: rw, height: rh, ...common }));
    layer.batchDraw();
  };

  const onRetouchDown = () => {
    const p = localPoint();
    if (!p) return;
    drawing.current = { pts: retouchTool === "brush" ? [p.x, p.y] : [], start: retouchTool === "brush" ? null : { x: p.x, y: p.y } };
  };
  const onRetouchMove = () => {
    if (!drawing.current) return;
    const p = localPoint();
    if (!p) return;
    if (retouchTool === "brush") {
      drawing.current.pts.push(p.x, p.y);
      previewBrush(drawing.current.pts);
    } else if (drawing.current.start) {
      previewRegion(drawing.current.start, p);
    }
  };
  const onRetouchUp = () => {
    const d = drawing.current;
    drawing.current = null;
    clearGuides();
    if (!d || !retouchTarget) return;
    if (retouchTool === "brush") {
      if (d.pts.length >= 2) addRetouchStroke(retouchTarget.id, { points: d.pts, size: retouchBrush });
    } else if (d.start) {
      const p = localPoint();
      if (p) {
        const x = Math.min(d.start.x, p.x);
        const y = Math.min(d.start.y, p.y);
        const rw = Math.abs(p.x - d.start.x);
        const rh = Math.abs(p.y - d.start.y);
        if (rw > 4 && rh > 4) addRetouchRegion(retouchTarget.id, { shape: retouchTool === "rect" ? "rect" : "circle", x, y, w: rw, h: rh });
      }
    }
  };

  return (
    <KStage
      ref={stageRef}
      width={w * scale}
      height={h * scale}
      scaleX={scale}
      scaleY={scale}
      onMouseDown={(e) => {
        if (retouchTarget) return onRetouchDown();
        if (e.target === e.target.getStage()) select(null);
      }}
      onMouseMove={() => retouchTarget && onRetouchMove()}
      onMouseUp={() => retouchTarget && onRetouchUp()}
      onTouchStart={(e) => {
        if (retouchTarget) return onRetouchDown();
        if (e.target === e.target.getStage()) select(null);
      }}
      onTouchMove={() => retouchTarget && onRetouchMove()}
      onTouchEnd={() => retouchTarget && onRetouchUp()}
      style={{ background: "transparent" }}
    >
      <KLayer>
        <Rect x={0} y={0} width={w} height={h} {...bgFill} listening={false} />
      </KLayer>
      <KLayer>
        {doc.layers.map((l) => {
          if (!l.visible) return null;
          const editable = isEditable(l);
          if (l.type === "text") {
            return (
              <Wrap
                key={l.id}
                nodeRef={setRef(l.id)}
                x={l.x}
                y={l.y}
                rotation={l.rotation}
                editable={editable}
                onSelect={() => editable && select(l.id)}
                onDragMove={onDragMove(l)}
                onDragEnd={onDragEnd(l)}
                onTransformEnd={onTransformEnd(l)}
              >
                <TextNode layer={{ ...l, x: 0, y: 0, rotation: 0 }} onEdit={editable ? () => onRequestTextEdit?.(l.id) : undefined} />
              </Wrap>
            );
          }
          if (l.type === "image" || l.type === "logo") {
            return (
              <Wrap
                key={l.id}
                nodeRef={setRef(l.id)}
                x={l.x}
                y={l.y}
                rotation={l.rotation}
                editable={editable}
                draggable={isDraggable(l)}
                onSelect={() => editable && select(l.id)}
                onDragMove={onDragMove(l)}
                onDragEnd={onDragEnd(l)}
                onTransformEnd={onTransformEnd(l)}
              >
                <ImageNode layer={{ ...l, x: 0, y: 0, rotation: 0 }} />
              </Wrap>
            );
          }
          return (
            <Wrap
              key={l.id}
              nodeRef={setRef(l.id)}
              x={l.x}
              y={l.y}
              rotation={l.rotation}
              editable={editable}
              onSelect={() => editable && select(l.id)}
              onDragMove={onDragMove(l)}
              onDragEnd={onDragEnd(l)}
              onTransformEnd={onTransformEnd(l)}
            >
              <ShapeNode layer={{ ...(l as ShapeLayer), x: 0, y: 0, rotation: 0 }} />
            </Wrap>
          );
        })}
      </KLayer>
      {/* live alignment guides drawn imperatively for smoothness */}
      <KLayer ref={guideRef} listening={false} />
      <KLayer>
        {interactive && (
          <Transformer
            ref={trRef}
            rotateEnabled
            keepRatio={false}
            anchorSize={11}
            anchorCornerRadius={6}
            borderStroke="#e8462b"
            anchorStroke="#e8462b"
            anchorFill="#ffffff"
            rotateAnchorOffset={26}
            boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
          />
        )}
      </KLayer>
    </KStage>
  );
});

// Wrapper group carrying position, rotation and interaction. Inner nodes render
// at local origin (0,0, rotation 0) so the transformer and drag math stay consistent.
import { Group } from "react-konva";
function Wrap({
  children,
  nodeRef,
  x,
  y,
  rotation,
  editable,
  draggable,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: {
  children: React.ReactNode;
  nodeRef: (n: Konva.Node | null) => void;
  x: number;
  y: number;
  rotation: number;
  editable: boolean;
  draggable?: boolean;
  onSelect: () => void;
  onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}) {
  return (
    <Group
      ref={nodeRef as never}
      x={x}
      y={y}
      rotation={rotation}
      draggable={draggable ?? editable}
      onMouseDown={onSelect}
      onTap={onSelect}
      onClick={onSelect}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      listening={editable}
    >
      {children}
    </Group>
  );
}
