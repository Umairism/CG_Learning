# Computer Graphics - Final Term Study Notes

## Final Term Topics

- DDA line drawing algorithm
- Bresenham line drawing algorithm
- Drawing and coordinate systems
- Polygon clipping
- Line clipping
- Modeling virtual reality appearance
- Texture mapping
- Applications and modern trends

## DDA Line Drawing Algorithm

DDA stands for Digital Differential Analyzer. It is a line drawing algorithm used to determine which pixels should be turned on to draw a straight line.

### DDA Main Idea

- Compute small incremental steps.
- Move from one point to the next using slope information.
- Plot rounded pixel positions.

### Algorithm steps

1. Take two endpoints.
2. Compute `dx` and `dy`.
3. Choose the larger value of `|dx|` or `|dy|` as the number of steps.
4. Compute `xInc` and `yInc`.
5. Plot each intermediate point.

### DDA advantages

- Easy to understand
- Easy to implement

### DDA disadvantages

- Uses floating-point arithmetic
- Rounding errors may occur

## Bresenham Line Drawing Algorithm

Bresenham's algorithm draws lines using integer arithmetic only.

### Why it is useful

- Faster than DDA
- More accurate for pixel-based drawing
- Avoids floating-point calculations

### Decision parameter

The decision parameter helps decide whether the next pixel should be East or North-East.

### For slope between 0 and 1

- If the decision parameter is negative, choose the E pixel.
- If it is positive or zero, choose the NE pixel.

### Bresenham advantages

- Efficient
- Fast
- Suitable for hardware and software rasterization

## Drawing and Coordinate Systems

This topic explains how objects are placed on screen.

### Important terms

- World window: selected region from the real world that will be displayed
- World coordinate system: coordinates of the object in the world
- Viewport: visible rectangular area on screen
- Screen coordinate system: actual display coordinates

### Window to viewport mapping

Window coordinates are converted to viewport coordinates so the object can be shown on the screen.

### Why it matters

- The same object can appear at different sizes on different screens.
- Aspect ratio must be matched to avoid distortion.

## Polygon Clipping

Polygon clipping is used to cut a polygon to the visible region.

### Polygon Clipping Main Idea

- Keep only the part of the polygon inside the clipping window.

### Sutherland-Hodgman clipping

This is a common polygon clipping method.

### Four cases for each edge

- Both inside: add the second point
- First inside, second outside: add intersection
- Both outside: add nothing
- First outside, second inside: add intersection and the second point

### Why it is used

- Useful for clipping simple and complex polygons
- Important in visible surface processing

## Line Clipping

Line clipping removes the part of a line that lies outside the drawing region.

### Line Clipping Main Idea

- Only display the part of the line that lies inside the window.

### Common strategies

- Check every point: correct but slow
- Clip coordinates directly: not accurate
- Compute intersections with boundaries: correct method

### Cohen-Sutherland line clipping

This is a well-known line clipping algorithm.

### Outcode idea

Each endpoint is assigned a 4-bit code to show its position relative to the clipping region.

### Cases

- Trivially accept if both points are inside
- Trivially reject if both points are outside in the same region
- Otherwise compute intersection and clip

## Modeling Virtual Reality Appearance

This topic explains how an object looks realistic in a 3D scene.

### Main components

- Material characteristics
- Lighting
- Shading
- Texture

### Phong reflection model

Phong model divides reflected light into:

- Ambient reflection
- Diffuse reflection
- Specular reflection

### Why it is important

It helps create realistic looking surfaces.

### Lighting and shading

- Flat shading colors each polygon with one color.
- Smooth shading interpolates colors across surfaces.

### OpenGL idea

- `glMaterialfv` sets material properties.
- `glShadeModel` chooses shading mode.

## Texture Mapping

Texture mapping wraps a 2D texture around a 3D object.

### Main idea

- A flat image is mapped to a 3D surface.
- The object looks more realistic.

### Steps in texture mapping

- Name the texture
- Bind the texture
- Set parameters
- Choose the application mode
- Create and enable the texture object

### OpenGL functions

- `glGenTextures`
- `glBindTexture`
- `glEnable`
- `glDisable`

### Why Texture Mapping Is Used

- Makes scenes more realistic
- Adds detail without increasing geometry too much

## Applications and Modern Trends

Computer graphics are used in many real-world areas.

### Applications

- Gaming and entertainment
- Education and training
- Medical imaging
- Engineering and architecture

### Modern trends

- Artificial intelligence in graphics
- Virtual reality and augmented reality
- Real-time ray tracing
- Metaverse and digital twins

### Example idea

A smart traffic system may use 3D roads, moving vehicles, traffic lights, animation, clipping, and lighting.

## Exam Revision Summary

- DDA and Bresenham are line drawing algorithms.
- Coordinate systems help map world objects to the screen.
- Polygon and line clipping control visibility.
- Phong lighting and shading improve realism.
- Texture mapping adds surface detail.
- Modern graphics are used in AI, VR, AR, and simulation.
