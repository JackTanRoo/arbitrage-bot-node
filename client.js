$( document ).ready(function() {
    console.log( "ready!" );
	
	TESTER = document.getElementById('chart');

    Plotly.plot ("chart", [{
    	x: [1,2,3,4],
    	y: [5,10,15,20],
    	type : "line"
    }])
});