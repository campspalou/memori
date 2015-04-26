var var_anterior=0;
var posicion_anterior="";

function create_array ()
{
	var numeros = [1,1,2,2,3,3,4,4,5,5,6,6]
	var cuadrado_array = [];
	var i, n;
	for (i=0, n=numeros.length; i < 12; ++i){

		posicion = Math.floor((Math.random() * n));

		cuadrado_array.push(numeros[posicion]);
		delete numeros[posicion]
		numeros.splice(posicion,1);
		n--;
	}
	return cuadrado_array;

}

function animar(){

	for (i=0, n=0; i < 3; ++i){
		for (e = 0, m=0; e < 4; e++){
			var posicion = "#cuadrado" + m + n;
			$(posicion).hover(function() {
				$(this).addClass("tossing");
			});

			$(posicion).click(function() {
			$(this).addClass("stretchRight");
			});
			
			$(posicion).mouseleave(function() {
				$(this).removeClass("tossing");
				$(this).removeClass("stretchRight");

			});


			m++;
		}
		n++;
	}
}

function Init () {
	cuadrado_array =  create_array ();
	for (i=0, n=0; i < 3; ++i){
		for (e = 0, m=0; e < 4; e++){
			var posicion = "cuadrado" + m + n;
			var cuadrado = document.getElementById(posicion);
			cuadrado.value = cuadrado_array.pop();
			m++;
		}
		n++;
	}
	//animar ();
}

function selcection(n,m)
{

	var tipo = ["CG.png","CR.png","CV.png","DG.png","DR.png","DV.png",];
	var posicion = "cuadrado" + n + m;
	var cuadrado = document.getElementById(posicion);
	var carta = cuadrado.value;
	if (cuadrado.value && posicion!==posicion_anterior)
	{
		if (var_anterior !== 0 && carta===var_anterior)
		{
			
			var jpg = tipo[cuadrado.value-1];
			var url = "url('Imagen\\\\" + jpg + "')"
			cuadrado.style.backgroundImage = url;
			var cuadrado_anterior = document.getElementById(posicion_anterior);
			cuadrado.value = 0;
			cuadrado_anterior.value = 0;
			var_anterior= 0;
			posicion_anterior = "";

		} else { if (var_anterior===0)
			{
				var_anterior = carta;
				posicion_anterior = posicion;
				var jpg = tipo[cuadrado.value-1];
				var url = "url('Imagen\\\\" + jpg + "')"
				cuadrado.style.backgroundImage = url;

			} else { 

				cuadrado.style.backgroundImage = "url('Imagen/base.png')";
				var cuadrado_anterior = document.getElementById(posicion_anterior);
				cuadrado_anterior.style.backgroundImage = "url('Imagen/base.png')";
				var_anterior = 0;
				posicion_anterior = "";

			}
		}
	}

}









