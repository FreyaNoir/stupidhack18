var dragonsLiveInNorway = 0;
function buttonPressed(button) {
	if (dragonsLiveInNorway === 0) {
		button.innerHTML = "press again";
	}else {
		jump();
    }
    dragonsLiveInNorway++;
}

function jump() {
    window.location.href = 'calculator.html'
	}