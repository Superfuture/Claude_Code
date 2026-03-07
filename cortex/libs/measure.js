String.prototype.measure = function(css) {
	$('body').append('<span id="just-a-dummy-ruler"></span>');
	
	var ruler = $('#just-a-dummy-ruler');
	var text = this.toString();
	
	ruler.css({ visibility: 'hidden', whiteSpace: 'nowrap' });
	
	if (typeof(css) != 'object') css = { };
	
	ruler.css(css);
	ruler.text(text);
	var ret = ruler.width();
	
	ruler.remove();
	
	return ret;
};