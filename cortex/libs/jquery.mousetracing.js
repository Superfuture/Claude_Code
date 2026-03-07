function recordMousePosition(e) {
	window.mouse.screenPos = { x: e.clientX, y: e.clientY };
	window.mouse.pagePos = { x: e.pageX, y: e.pageY };
}

//Trace mouse position (only possible in event handler)
document.addEventListener('mousemove', recordMousePosition, true);

document.addEventListener('mousedown', function(e) {
	recordMousePosition(e);
	window.mouse.isPressed = true;
}, true);

document.addEventListener('mouseup', function(e) {
	recordMousePosition(e);
	window.mouse.isPressed = false;
}, true);

window.mouse = {
	isPressed: false,
	screenPos: { x: 0, y: 0 },
	pagePos: { x: 0, y: 0 }
};