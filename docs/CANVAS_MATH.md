# Brainstorm Canvas Mathematical Architecture

This document describes the geometric transformations, coordinate systems, focal-point zoom invariance, and curve calculation models powering DesignFlow's infinite brainstorming canvas.

---

## 1. Coordinate Systems

The canvas utilizes three distinct coordinate systems:

```
+-----------------------------------------------------------+
| Screen / Window Space (clientX, clientY)                  |
|                                                           |
|   +-------------------------------------------------+     |
|   | Viewport Space (relative to canvas container)   |     |
|   |                                                 |     |
|   |    +---------------------------------------+    |     |
|   |    | World / Canvas Space                  |    |     |
|   |    | (Unbounded virtual plane)             |    |     |
|   |    | Origin (0, 0)                         |    |     |
|   |    +---------------------------------------+    |     |
|   +-------------------------------------------------+     |
+-----------------------------------------------------------+
```

1. **Screen / Window Space ($\vec{P}_{screen}$)**:
   Absolute coordinates reported by browser DOM pointer and mouse events (`e.clientX`, `e.clientY`).
2. **Viewport Space ($\vec{P}_{vp}$)**:
   Coordinates relative to the top-left boundary of the canvas container element (`getBoundingClientRect()`):
   $$\vec{P}_{vp} = \vec{P}_{screen} - \vec{Origin}_{container}$$
3. **World / Canvas Space ($\vec{P}_{canvas}$)**:
   The unbounded virtual space where idea nodes and SVG relationship paths reside. Node coordinates $(x, y)$ in IndexedDB are stored strictly in this coordinate system.

---

## 2. Affine Transformation Matrix

The visible canvas plane is positioned and scaled using a 2D affine transformation represented by pan offsets $(pan_x, pan_y)$ and scale factor $s$ (`zoom`):

### Forward Transform (Canvas $\to$ Viewport Screen)
Converts a canvas coordinate $\vec{P}_c = (x_c, y_c)$ to its rendered viewport position $\vec{P}_v = (x_v, y_v)$:

$$\begin{bmatrix} x_v \\ y_v \\ 1 \end{bmatrix} = \begin{bmatrix} s & 0 & pan_x \\ 0 & s & pan_y \\ 0 & 0 & 1 \end{bmatrix} \begin{bmatrix} x_c \\ y_c \\ 1 \end{bmatrix}$$

Expanding the matrix multiplication:
$$x_v = x_c \cdot s + pan_x$$
$$y_v = y_c \cdot s + pan_y$$

In CSS, this is applied via hardware-accelerated 3D transforms:
```css
transform: translate3d(panX px, panY px, 0px) scale(zoom);
```

### Inverse Transform (Viewport Screen $\to$ Canvas)
Converts a pointer event location back into the canvas world space:

$$\begin{bmatrix} x_c \\ y_c \end{bmatrix} = \frac{1}{s} \left( \begin{bmatrix} x_v \\ y_v \end{bmatrix} - \begin{bmatrix} pan_x \\ pan_y \end{bmatrix} \right)$$

$$x_c = \frac{x_v - pan_x}{s}$$
$$y_c = \frac{y_v - pan_y}{s}$$

---

## 3. Zoom Focal-Point Invariance

When zooming via the mouse wheel, the point directly under the pointer $\vec{P}_{focal} = (x_f, y_f)$ must remain stationary on screen to prevent disorienting jumps.

### Derivation:
Let $\vec{P}_c$ be the world coordinate under the cursor before and after zooming:

$$\vec{P}_c = \frac{\vec{P}_f - \vec{pan}_1}{s_1} = \frac{\vec{P}_f - \vec{pan}_2}{s_2}$$

Multiplying both sides by $s_2$:

$$\frac{s_2}{s_1} (\vec{P}_f - \vec{pan}_1) = \vec{P}_f - \vec{pan}_2$$

Solving for the new pan vector $\vec{pan}_2$:

$$\vec{pan}_2 = \vec{P}_f - \frac{s_2}{s_1} (\vec{P}_f - \vec{pan}_1)$$

Or equivalently:
$$\vec{pan}_2 = \vec{pan}_1 - (\vec{P}_f - \vec{pan}_1) \cdot \left(\frac{s_2}{s_1} - 1\right)$$

In TypeScript implementation (`useCanvasZoom.ts`):
```ts
const scaleRatio = newZoom / currentZoom;
const nextPanX = focalX - scaleRatio * (focalX - currentPan.x);
const nextPanY = focalY - scaleRatio * (focalY - currentPan.y);
```

---

## 4. Smart Edge Docking & Cubic Bézier Curves

Connection lines between idea cards are drawn as smooth cubic Bézier splines $B(t)$ with dynamic edge docking.

### Docking Edge Determination
Given source card $A = (x_a, y_a, w_a, h_a)$ and target card $B = (x_b, y_b, w_b, h_b)$:

1. **Horizontal Right Docking**: If $x_b \ge x_a + w_a$ (target is to the right of source):
   $$P_{start} = (x_a + w_a, \, y_a + h_a / 2)$$
   $$P_{end} = (x_b, \, y_b + h_b / 2)$$

2. **Horizontal Left Docking**: If $x_b + w_b \le x_a$ (target is to the left of source):
   $$P_{start} = (x_a, \, y_a + h_a / 2)$$
   $$P_{end} = (x_b + w_b, \, y_b + h_b / 2)$$

3. **Vertical Docking**: If bounding boxes horizontally overlap:
   $$P_{start} = (x_a + w_a / 2, \, y_b > y_a ? y_a + h_a : y_a)$$
   $$P_{end} = (x_b + w_b / 2, \, y_b > y_a ? y_b : y_b + h_b)$$

### Cubic Bézier Spline Geometry
The curve is defined parametrically for $t \in [0, 1]$:

$$B(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3$$

Where:
- $P_0 = P_{start}$ (docking exit)
- $P_3 = P_{end}$ (docking entry)
- $P_1 = (P_{0,x} + \Delta x \cdot \kappa, \, P_{0,y})$ (horizontal tangent control point 1)
- $P_2 = (P_{3,x} - \Delta x \cdot \kappa, \, P_{3,y})$ (horizontal tangent control point 2)
- $\kappa = \max(40, |\Delta x| \cdot 0.5)$ (curvature coefficient)

SVG Path format:
```svg
<path d="M P0.x P0.y C P1.x P1.y, P2.x P2.y, P3.x P3.y" />
```

---

## 5. Boundary Clamping & Safety Envelopes

To prevent panning into an unrecoverable void, all coordinates are constrained within safety bounds $[-6000, 6000]$:

$$\text{clamp}(v, min, max) = \max(min, \, \min(max, \, \text{round}(v)))$$

Non-finite inputs (`NaN`, `Infinity`) are automatically sanitized to $0$.

---

## 6. Rendering Performance & GPU Offloading

- **`transform-style: preserve-3d` & `will-change: transform`**:
  Promotes the canvas viewport and cards to hardware-accelerated GPU compositing textures, preventing layout recalculation on every pointer movement.
- **`requestAnimationFrame` Throttling**:
  Coalesces high-frequency pointer move events (up to 240Hz on gaming hardware) to match the display refresh rate (60Hz / 120Hz).
- **`React.memo` Isolation**:
  Isolates individual node cards and SVG connections so dragging one node does not trigger recalculations or re-renders across other entities.
