"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ImageOff, Trash2 } from "lucide-react";
import { useEditor } from "../../store";
import { DESIGNS_CHANGED, deleteDesign, listDesigns, type SavedDesign } from "../../savedDesigns";

export function SavedPanel({ onOpen }: { onOpen?: () => void }) {
  const loadTemplate = useEditor((s) => s.loadTemplate);
  const [items, setItems] = useState<SavedDesign[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    try {
      setItems(await listDesigns());
      setFailed(false);
    } catch {
      setItems([]);
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    void load();
    window.addEventListener(DESIGNS_CHANGED, load);
    return () => window.removeEventListener(DESIGNS_CHANGED, load);
  }, [load]);

  const open = (d: SavedDesign) => {
    if (!d.design?.layers) return;
    loadTemplate(d.design);
    onOpen?.();
  };

  const remove = async (d: SavedDesign) => {
    if (!confirm(`Delete "${d.name}"?`)) return;
    try {
      await deleteDesign(d.id);
    } catch {
      setFailed(true);
    }
  };

  if (items === null) return null;

  return (
    <div className="h-full overflow-y-auto p-2.5">
      {failed && <p className="mb-2 text-xs text-vermilion">Browser storage is unavailable.</p>}
      {items.length === 0 ? (
        <p className="p-6 text-center text-xs text-ink-soft">No saved designs yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {items.map((d) => (
            <div key={d.id} className="group relative">
              <button type="button" onClick={() => open(d)} className="block w-full text-left" title={d.name}>
                <Thumb blob={d.thumbnail} />
                <div className="mt-1 truncate text-[11px] text-ink-soft">{d.name}</div>
              </button>
              <button
                type="button"
                onClick={() => remove(d)}
                aria-label={`Delete ${d.name}`}
                className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-md border border-line bg-panel/90 text-ink-soft transition hover:border-vermilion hover:text-vermilion"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Thumb({ blob }: { blob: Blob | null }) {
  const url = useMemo(() => (blob ? URL.createObjectURL(blob) : null), [blob]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);
  return (
    <div className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-lg border border-line bg-white transition group-hover:border-brand">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-contain" />
      ) : (
        <ImageOff size={22} className="text-ink-soft" />
      )}
    </div>
  );
}
