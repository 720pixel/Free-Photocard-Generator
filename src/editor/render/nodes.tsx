"use client";
import { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { Circle, Ellipse, Group, Image as KImage, Line, Path, Rect, RegularPolygon, Text } from "react-konva";
import type { ImageLayer, ShapeLayer, TextLayer, BlendMode } from "../types";
import { fillProps } from "./fills";
import { useImageEl } from "./useImage";
import { textureDataUrl, textureFullDataUrl, textureIsCover } from "../textures";
import { fontStack } from "../fonts";
import { isCustomFrameShape, drawFrameShape, frameShapePath } from "../frameShapes";

function gco(blend: BlendMode): GlobalCompositeOperation {
  return (blend === "normal" ? "source-over" : blend) as GlobalCompositeOperation;
}

// ---- Shapes ----------------------------------------------------------------
export function ShapeNode({ layer }: { layer: ShapeLayer }) {
  const common = {
    opacity: layer.opacity,
    globalCompositeOperation: gco(layer.blend),
    rotation: layer.rotation,
    // Listen so the wrapping interactive Group has a hit area (select/drag).
    listening: true,
  } as const;
  const fp = fillProps(layer.fill, layer.width, layer.height);
  const stroke = layer.stroke.enabled
    ? { stroke: layer.stroke.color, strokeWidth: layer.stroke.width, dash: layer.dash.length ? layer.dash : undefined }
    : {};

  // Texture overlay (rect/rounded only). Tile textures repeat at constant px;
  // cover textures (halftone fades, grunge) stretch one full-area image.
  const cover = !!layer.texture && textureIsCover(layer.texture.kind);
  const genW = Math.min(1400, Math.max(2, Math.round(layer.width)));
  const genH = Math.max(2, Math.round((layer.height * genW) / Math.max(1, layer.width)));
  const texUrl = layer.texture ? (cover ? textureFullDataUrl(layer.texture, genW, genH) : textureDataUrl(layer.texture)) : null;
  const texImg = useImageEl(texUrl);
  if (layer.texture && (layer.shape === "rect" || layer.shape === "rounded")) {
    const radius = layer.shape === "rounded" ? layer.cornerRadius : 0;
    const patternProps = cover
      ? {
          fillPatternImage: texImg!,
          fillPatternRepeat: "no-repeat" as const,
          fillPatternScaleX: layer.width / genW,
          fillPatternScaleY: layer.height / genH,
        }
      : { fillPatternImage: texImg!, fillPatternRepeat: "repeat" as const };
    return (
      <Group x={layer.x} y={layer.y} rotation={layer.rotation} opacity={layer.opacity} globalCompositeOperation={gco(layer.blend)}>
        <Rect width={layer.width} height={layer.height} cornerRadius={radius} {...fp} {...stroke} listening />
        {texImg && <Rect width={layer.width} height={layer.height} cornerRadius={radius} {...patternProps} listening={false} />}
      </Group>
    );
  }

  if (layer.shape === "path" && layer.pathData) {
    return <Path x={layer.x} y={layer.y} data={layer.pathData} {...fp} {...stroke} {...common} />;
  }
  if (layer.shape === "circle") {
    const r = Math.min(layer.width, layer.height) / 2;
    return <Circle x={layer.x + layer.width / 2} y={layer.y + layer.height / 2} radius={r} {...fp} {...stroke} {...common} />;
  }
  if (layer.shape === "ellipse") {
    return (
      <Ellipse
        x={layer.x + layer.width / 2}
        y={layer.y + layer.height / 2}
        radiusX={layer.width / 2}
        radiusY={layer.height / 2}
        {...fp}
        {...stroke}
        {...common}
      />
    );
  }
  if (layer.shape === "triangle") {
    return (
      <Line
        x={layer.x}
        y={layer.y}
        points={[layer.width / 2, 0, layer.width, layer.height, 0, layer.height]}
        closed
        {...fp}
        {...stroke}
        {...common}
      />
    );
  }
  // rect / rounded
  return (
    <Rect
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      cornerRadius={layer.shape === "rounded" ? layer.cornerRadius : 0}
      {...fp}
      {...stroke}
      {...common}
    />
  );
}

// ---- Text ------------------------------------------------------------------
export function TextNode({ layer, onEdit }: { layer: TextLayer; onEdit?: () => void }) {
  const ref = useRef<Konva.Text>(null);
  const [bgRects, setBgRects] = useState<{ x: number; y: number; w: number; h: number }[]>([]);

  // Compute per-line (or full-box) background rects from Konva's line layout.
  const bg = layer.bg;
  useEffect(() => {
    if (!bg?.enabled) {
      setBgRects([]);
      return;
    }
    const id = requestAnimationFrame(() => {
      const node = ref.current;
      if (!node) return;
      const arr = (node as unknown as { textArr?: { width: number }[] }).textArr ?? [];
      const fs = node.fontSize();
      const lh = fs * layer.lineHeight;
      const boxW = layer.width;
      const lineX = (lw: number) => (layer.align === "center" ? (boxW - lw) / 2 : layer.align === "right" ? boxW - lw : 0);
      if (bg.perLine) {
        setBgRects(
          arr
            .filter((ln) => ln.width > 0)
            .map((ln, i) => ({
              x: lineX(ln.width) - bg.padX,
              y: i * lh + (lh - fs) / 2 - bg.padY,
              w: ln.width + bg.padX * 2,
              h: fs + bg.padY * 2,
            })),
        );
      } else {
        const maxW = Math.max(1, ...arr.map((l) => l.width));
        setBgRects([{ x: lineX(maxW) - bg.padX, y: -bg.padY + (lh - fs) / 2, w: maxW + bg.padX * 2, h: arr.length * lh - (lh - fs) + bg.padY * 2 }]);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [bg?.enabled, bg?.perLine, bg?.padX, bg?.padY, layer.text, layer.fontSize, layer.width, layer.height, layer.fontFamily, layer.letterSpacing, layer.lineHeight, layer.align, layer.autoFit]);

  // Auto-fit: shrink font until the text fits the height, then leave wrap on.
  useEffect(() => {
    if (!layer.autoFit) return;
    const node = ref.current;
    if (!node) return;
    let size = layer.fontSize;
    node.fontSize(size);
    node.width(layer.width);
    // shrink to fit height
    let guard = 0;
    while (node.height() > layer.height && size > 12 && guard < 200) {
      size -= 2;
      node.fontSize(size);
      guard++;
    }
    node.getLayer()?.batchDraw();
  }, [layer.autoFit, layer.text, layer.fontSize, layer.width, layer.height, layer.fontFamily, layer.letterSpacing, layer.lineHeight]);

  const fontStyle = layer.fontWeight >= 600 ? "bold" : "normal";
  const shadowProps = layer.shadow.enabled
    ? {
        shadowColor: layer.shadow.color,
        shadowBlur: layer.shadow.blur,
        shadowOffsetX: layer.shadow.x,
        shadowOffsetY: layer.shadow.y,
        shadowOpacity: layer.shadow.opacity,
      }
    : {};
  // Glow renders as a soft same-color shadow with no offset.
  const glowProps =
    layer.glow.enabled && !layer.shadow.enabled
      ? { shadowColor: layer.glow.color, shadowBlur: layer.glow.strength, shadowOpacity: 1 }
      : {};

  return (
    <Group
      x={layer.x}
      y={layer.y}
      opacity={layer.opacity}
      globalCompositeOperation={gco(layer.blend)}
      rotation={layer.rotation}
    >
      {layer.highlight.kind !== "none" && (
        <Rect width={layer.width} height={layer.height} {...fillProps(layer.highlight, layer.width, layer.height)} cornerRadius={8} listening={false} />
      )}
      {bg?.enabled &&
        (() => {
          const frosted = bg.frost || (bg.blur ?? 0) > 0;
          const frostBlur = bg.blur ?? (bg.frost ? Math.max(8, bg.padY * 2) : 0);
          return bgRects.map((r, i) => (
          <Rect
            key={"bg" + i}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            cornerRadius={bg.radius}
            fill={bg.color}
            opacity={frosted ? bg.opacity * 0.6 : bg.opacity}
            shadowColor={frosted ? bg.color : undefined}
            shadowBlur={frosted ? Math.max(4, frostBlur) : 0}
            shadowOpacity={frosted ? 0.55 : 0}
            listening={false}
          />
          ));
        })()}
      <Text
        ref={ref}
        text={layer.text}
        width={layer.width}
        height={layer.autoFit ? undefined : layer.height}
        fontSize={layer.fontSize}
        fontFamily={fontStack(layer.fontFamily)}
        fontStyle={fontStyle}
        fill={layer.fill}
        align={layer.align}
        verticalAlign={layer.vAlign}
        lineHeight={layer.lineHeight}
        letterSpacing={layer.letterSpacing}
        wrap="word"
        stroke={layer.stroke.enabled ? layer.stroke.color : undefined}
        strokeWidth={layer.stroke.enabled ? layer.stroke.width : 0}
        fillAfterStrokeEnabled
        {...shadowProps}
        {...glowProps}
        onDblClick={onEdit}
        onDblTap={onEdit}
        listening={!!onEdit}
      />
    </Group>
  );
}

// ---- Image / Logo ----------------------------------------------------------
const KONVA_FILTERS = [Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL, Konva.Filters.Blur];

export function ImageNode({ layer }: { layer: ImageLayer }) {
  const imgRef = useRef<Konva.Image>(null);
  const img = useImageEl(layer.src);
  const a = layer.adjustments;

  // (re)cache to apply filters when image or adjustments change.
  useEffect(() => {
    const node = imgRef.current;
    if (!node || !img) return;
    node.cache();
    node.getLayer()?.batchDraw();
  }, [img, a.brightness, a.contrast, a.saturation, a.hue, a.blur, layer.width, layer.height]);

  const clip = (ctx: Konva.Context) => {
    const w = layer.width;
    const h = layer.height;
    if (layer.mask === "circle") {
      const r = Math.min(w, h) / 2;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2, false);
      ctx.closePath();
    } else if (layer.mask === "rounded") {
      const r = Math.min(layer.cornerRadius, w / 2, h / 2);
      roundRect(ctx as unknown as CanvasRenderingContext2D, 0, 0, w, h, r);
    } else if (isCustomFrameShape(layer.mask)) {
      drawFrameShape(ctx as unknown as CanvasRenderingContext2D, layer.mask, w, h);
    } else {
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.closePath();
    }
  };

  // compute cover/contain draw rect inside the mask box
  const drawRect = computeFit(layer, img);

  const main = (
    <Group
      x={layer.x}
      y={layer.y}
      opacity={layer.opacity}
      globalCompositeOperation={gco(layer.blend)}
      rotation={layer.rotation}
      clipFunc={clip}
    >
      {img ? (
        <KImage
          ref={imgRef}
          image={img}
          x={drawRect.x}
          y={drawRect.y}
          width={drawRect.w}
          height={drawRect.h}
          filters={KONVA_FILTERS}
          brightness={a.brightness}
          contrast={a.contrast}
          saturation={a.saturation}
          hue={a.hue}
          blurRadius={a.blur}
          listening={true}
        />
      ) : (
        <PlaceholderBox layer={layer} />
      )}
      {img && layer.retouch && (layer.retouch.strokes.length > 0 || layer.retouch.regions.length > 0) && (
        <RetouchOverlay layer={layer} img={img} drawRect={drawRect} />
      )}
      {layer.overlay && layer.overlay.fill.kind !== "none" && (
        <Rect
          width={layer.width}
          height={layer.height}
          {...fillProps(layer.overlay.fill, layer.width, layer.height)}
          opacity={layer.overlay.opacity}
          globalCompositeOperation={gco(layer.overlay.blend)}
          listening={false}
        />
      )}
      {layer.stroke.enabled && (
        <StrokeFrame layer={layer} />
      )}
      {layer.frame && layer.frame.style !== "none" && <FrameNodes layer={layer} />}
    </Group>
  );

  if (img && layer.frame?.style === "stack") {
    return (
      <>
        <StackBackdrop layer={layer} img={img} />
        {main}
      </>
    );
  }
  return main;
}

// Blurred, scaled, rotated copy of the photo sitting behind it (screenshot look).
function StackBackdrop({ layer, img }: { layer: ImageLayer; img: HTMLImageElement }) {
  const ref = useRef<Konva.Image>(null);
  const pad = Math.min(layer.width, layer.height) * 0.14;
  const bw = layer.width + pad * 2;
  const bh = layer.height + pad * 2;
  useEffect(() => {
    const n = ref.current;
    if (!n) return;
    n.cache();
    n.getLayer()?.batchDraw();
  }, [img, layer.width, layer.height]);
  // cover-fit the image into the enlarged box, centred on origin
  const iw = img.naturalWidth || 1;
  const ih = img.naturalHeight || 1;
  const ratio = iw / ih;
  let dw = bw;
  let dh = bw / ratio;
  if (dh < bh) {
    dh = bh;
    dw = bh * ratio;
  }
  return (
    <Group x={layer.x + layer.width / 2} y={layer.y + layer.height / 2} rotation={layer.rotation + 5} opacity={0.92} listening={false}>
      <KImage
        ref={ref}
        image={img}
        x={-dw / 2}
        y={-dh / 2}
        width={dw}
        height={dh}
        filters={[Konva.Filters.Blur]}
        blurRadius={Math.max(12, Math.min(bw, bh) * 0.07)}
      />
    </Group>
  );
}

// Masked blur/mosaic drawn over the photo, clipped to the retouch strokes+regions.
function RetouchOverlay({ layer, img, drawRect }: { layer: ImageLayer; img: HTMLImageElement; drawRect: { x: number; y: number; w: number; h: number } }) {
  const ref = useRef<Konva.Image>(null);
  const rt = layer.retouch!;
  useEffect(() => {
    const n = ref.current;
    if (!n) return;
    n.cache();
    n.getLayer()?.batchDraw();
  }, [img, rt.mode, rt.intensity, layer.width, layer.height, drawRect.x, drawRect.y, drawRect.w, drawRect.h]);

  const clipMask = (ctx: Konva.Context) => {
    const c = ctx as unknown as CanvasRenderingContext2D;
    ctx.beginPath();
    // Brush strokes as a CONTINUOUS filled band: a disc at every sampled point
    // plus a filled quad connecting consecutive points (a capsule chain). This
    // fixes the old zero-area polyline that left gaps on fast drags.
    for (const s of rt.strokes) {
      const p = s.points;
      const r = Math.max(1, s.size / 2);
      for (let i = 0; i < p.length; i += 2) {
        c.moveTo(p[i] + r, p[i + 1]);
        c.arc(p[i], p[i + 1], r, 0, Math.PI * 2);
      }
      for (let i = 0; i < p.length - 2; i += 2) {
        const x0 = p[i], y0 = p[i + 1], x1 = p[i + 2], y1 = p[i + 3];
        const dx = x1 - x0, dy = y1 - y0;
        const len = Math.hypot(dx, dy) || 1;
        const nx = (-dy / len) * r, ny = (dx / len) * r;
        c.moveTo(x0 + nx, y0 + ny);
        c.lineTo(x1 + nx, y1 + ny);
        c.lineTo(x1 - nx, y1 - ny);
        c.lineTo(x0 - nx, y0 - ny);
        c.closePath();
      }
    }
    for (const r of rt.regions) {
      if (r.shape === "circle") {
        c.moveTo(r.x + r.w, r.y + r.h / 2);
        c.ellipse(r.x + r.w / 2, r.y + r.h / 2, r.w / 2, r.h / 2, 0, 0, Math.PI * 2);
      } else {
        ctx.rect(r.x, r.y, r.w, r.h);
      }
    }
  };

  // blur -> Gaussian blur; pixelate -> fine Pixelate; mosaic -> coarse Pixelate.
  const filters = rt.mode === "blur" ? [Konva.Filters.Blur] : [Konva.Filters.Pixelate];
  const extra =
    rt.mode === "blur"
      ? { blurRadius: Math.max(2, rt.intensity) }
      : { pixelSize: Math.max(2, Math.round(rt.mode === "mosaic" ? rt.intensity : rt.intensity * 0.6)) };

  return (
    <Group clipFunc={clipMask} listening={false}>
      {/* also stroke the brush path so thin strokes read as filled bands */}
      <Group>
        <KImage ref={ref} image={img} x={drawRect.x} y={drawRect.y} width={drawRect.w} height={drawRect.h} filters={filters} {...extra} />
      </Group>
    </Group>
  );
}

// Decorative frames drawn on top of the image edges (see editor/frames.ts).
function FrameNodes({ layer }: { layer: ImageLayer }) {
  const f = layer.frame!;
  const w = layer.width;
  const h = layer.height;
  const t = Math.max(1, f.width);
  const col = f.color;
  const col2 = f.color2;

  // Circular masks get concentric-ring treatments.
  if (layer.mask === "circle") {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2;
    if (f.style === "double") {
      return (
        <>
          <Circle x={cx} y={cy} radius={r - t / 2} stroke={col} strokeWidth={t} listening={false} />
          <Circle x={cx} y={cy} radius={r - t * 2} stroke={col} strokeWidth={Math.max(1, t * 0.4)} listening={false} />
        </>
      );
    }
    const dash = f.style === "dashed" ? [t * 2, t * 1.5] : f.style === "dotted" ? [0.5, t * 1.6] : undefined;
    return <Circle x={cx} y={cy} radius={r - t / 2} stroke={col} strokeWidth={t} dash={dash} lineCap={f.style === "dotted" ? "round" : "butt"} listening={false} />;
  }

  const bandBottom = f.style === "polaroid" ? t * 2.4 : t;
  switch (f.style) {
    case "polaroid":
    case "mat":
    case "film": {
      const bandCol = f.style === "film" ? "#141414" : f.style === "polaroid" ? col : col;
      const top = f.style === "film" ? t * 1.3 : t;
      const side = f.style === "film" ? 0 : t;
      const bot = f.style === "film" ? t * 1.3 : bandBottom;
      const bands = (
        <>
          <Rect x={0} y={0} width={w} height={top} fill={bandCol} listening={false} />
          <Rect x={0} y={h - bot} width={w} height={bot} fill={bandCol} listening={false} />
          {side > 0 && <Rect x={0} y={0} width={side} height={h} fill={bandCol} listening={false} />}
          {side > 0 && <Rect x={w - side} y={0} width={side} height={h} fill={bandCol} listening={false} />}
        </>
      );
      if (f.style === "film") {
        const holes = [];
        const gap = Math.max(t * 1.6, 10);
        for (let x = gap * 0.4; x < w - t; x += gap) {
          holes.push(<Rect key={"ht" + x} x={x} y={top * 0.35} width={t * 0.5} height={top * 0.3} fill={col2} cornerRadius={1} listening={false} />);
          holes.push(<Rect key={"hb" + x} x={x} y={h - bot + bot * 0.35} width={t * 0.5} height={bot * 0.3} fill={col2} cornerRadius={1} listening={false} />);
        }
        return <>{bands}{holes}</>;
      }
      if (f.style === "mat") {
        return (
          <>
            {bands}
            <Rect x={t} y={t} width={w - t * 2} height={h - t * 2} stroke={col2} strokeWidth={Math.max(1, t * 0.12)} listening={false} />
          </>
        );
      }
      return bands;
    }
    case "double":
      return (
        <>
          <Rect x={t / 2} y={t / 2} width={w - t} height={h - t} stroke={col} strokeWidth={t} listening={false} />
          <Rect x={t * 2} y={t * 2} width={w - t * 4} height={h - t * 4} stroke={col} strokeWidth={Math.max(1, t * 0.4)} listening={false} />
        </>
      );
    case "dashed":
      return <Rect x={t / 2} y={t / 2} width={w - t} height={h - t} stroke={col} strokeWidth={t} dash={[t * 2, t * 1.5]} listening={false} />;
    case "dotted":
      return <Rect x={t / 2} y={t / 2} width={w - t} height={h - t} stroke={col} strokeWidth={t} dash={[0.5, t * 1.6]} lineCap="round" listening={false} />;
    case "corners": {
      const len = Math.min(w, h) * 0.22;
      const mk = (pts: number[], key: string) => <Line key={key} points={pts} stroke={col} strokeWidth={t} lineCap="square" listening={false} />;
      return (
        <>
          {mk([0, len, 0, 0, len, 0], "tl")}
          {mk([w - len, 0, w, 0, w, len], "tr")}
          {mk([w, h - len, w, h, w - len, h], "br")}
          {mk([len, h, 0, h, 0, h - len], "bl")}
        </>
      );
    }
    case "tape": {
      const tw = Math.min(w, h) * 0.28;
      const th = tw * 0.42;
      return (
        <>
          <Rect x={-tw * 0.3} y={h * 0.1} width={tw} height={th} rotation={-28} fill={col} opacity={0.8} listening={false} />
          <Rect x={w - tw * 0.7} y={h * 0.9 - th} width={tw} height={th} rotation={-28} fill={col} opacity={0.8} listening={false} />
        </>
      );
    }
    case "ticket":
      return (
        <>
          <Rect x={t / 2} y={t / 2} width={w - t} height={h - t} stroke={col} strokeWidth={t} listening={false} />
          <Circle x={0} y={h / 2} radius={t * 1.4} fill={col2} stroke={col} strokeWidth={Math.max(1, t * 0.3)} listening={false} />
          <Circle x={w} y={h / 2} radius={t * 1.4} fill={col2} stroke={col} strokeWidth={Math.max(1, t * 0.3)} listening={false} />
        </>
      );
    case "shadowbox":
      return (
        <>
          <Rect x={t / 2 + t} y={t / 2 + t} width={w - t} height={h - t} stroke={col2} strokeWidth={t} listening={false} />
          <Rect x={t / 2} y={t / 2} width={w - t} height={h - t} stroke={col} strokeWidth={t} listening={false} />
        </>
      );
    case "line":
    default:
      return <Rect x={t / 2} y={t / 2} width={w - t} height={h - t} stroke={col} strokeWidth={t} listening={false} />;
  }
}

function StrokeFrame({ layer }: { layer: ImageLayer }) {
  const w = layer.width;
  const h = layer.height;
  if (layer.mask === "circle") {
    return <Circle x={w / 2} y={h / 2} radius={Math.min(w, h) / 2 - layer.stroke.width / 2} stroke={layer.stroke.color} strokeWidth={layer.stroke.width} listening={false} />;
  }
  if (isCustomFrameShape(layer.mask)) {
    const d = frameShapePath(layer.mask, 0, 0, w, h)!;
    return <Path data={d} stroke={layer.stroke.color} strokeWidth={layer.stroke.width} listening={false} />;
  }
  return (
    <Rect
      width={w}
      height={h}
      cornerRadius={layer.mask === "rounded" ? layer.cornerRadius : 0}
      stroke={layer.stroke.color}
      strokeWidth={layer.stroke.width}
      listening={false}
    />
  );
}

function PlaceholderBox({ layer }: { layer: ImageLayer }) {
  return (
    <>
      <Rect width={layer.width} height={layer.height} fill={layer.type === "logo" ? "#e9e9ef" : "#dfe3ea"} cornerRadius={layer.mask === "rounded" ? layer.cornerRadius : 0} listening={true} />
      <Text
        width={layer.width}
        height={layer.height}
        text={layer.placeholderLabel}
        align="center"
        verticalAlign="middle"
        fontSize={Math.max(18, Math.min(layer.width, layer.height) * 0.09)}
        fontFamily="Hind Siliguri"
        fill="#8b93a1"
        listening={false}
      />
    </>
  );
}

function computeFit(layer: ImageLayer, img: HTMLImageElement | null) {
  const w = layer.width;
  const h = layer.height;
  if (!img) return { x: 0, y: 0, w, h };
  const iw = img.naturalWidth || 1;
  const ih = img.naturalHeight || 1;
  const boxRatio = w / h;
  const imgRatio = iw / ih;
  let dw: number, dh: number;
  const cover = layer.fit === "cover";
  if (cover ? imgRatio > boxRatio : imgRatio < boxRatio) {
    dh = h;
    dw = h * imgRatio;
  } else {
    dw = w;
    dh = w / imgRatio;
  }
  dw *= layer.zoom;
  dh *= layer.zoom;
  const x = (w - dw) * layer.offsetX;
  const y = (h - dh) * layer.offsetY;
  return { x, y, w: dw, h: dh };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
