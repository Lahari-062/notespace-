
import { useEffect, useRef, useState } from "react";
import "./DoodleCanvas.css";

export default function DoodleCanvas({
  initialData = "",
  onSave,
  saveLabel = "Save doodle",
}) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const [color, setColor] = useState("#222222");
  const [brushSize, setBrushSize] = useState(4);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");

    // Start with a white drawing surface.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    if (initialData) {
      const image = new Image();

      image.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
      };

      image.src = initialData;
    }
  }, [initialData]);

  function getPosition(event) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function startDrawing(event) {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const position = getPosition(event);

    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);

    context.beginPath();
    context.moveTo(position.x, position.y);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = color;
    context.lineWidth = brushSize;
  }

  function draw(event) {
    if (!drawingRef.current) return;

    const context = canvasRef.current.getContext("2d");
    const position = getPosition(event);

    context.lineTo(position.x, position.y);
    context.stroke();
  }

  function stopDrawing() {
    if (!drawingRef.current) return;

    drawingRef.current = false;

    const context = canvasRef.current.getContext("2d");
    context.closePath();
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    setSavedMessage("");
  }

  function saveDoodle() {
    const imageData = canvasRef.current.toDataURL("image/png");
    onSave?.(imageData);
    setSavedMessage("Doodle saved!");
  }

  return (
    <section className="doodle-panel">
      <div className="doodle-toolbar">
        <label className="doodle-color">
          Pen color
          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </label>

        <label className="doodle-brush">
          Pen size: {brushSize}
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(event) =>
              setBrushSize(Number(event.target.value))
            }
          />
        </label>

        <button type="button" onClick={clearCanvas}>
          Clear
        </button>

        <button type="button" onClick={saveDoodle}>
          {saveLabel}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        className="doodle-canvas"
        width={900}
        height={500}
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerCancel={stopDrawing}
        onPointerLeave={stopDrawing}
        aria-label="Doodle drawing area"
      />

      {savedMessage && (
        <p className="doodle-saved-message">{savedMessage}</p>
      )}
    </section>
  );
}
