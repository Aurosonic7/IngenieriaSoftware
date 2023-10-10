//Importar Datos de excel
function importarDatos(){
    console.log("Entre a importar datos");
    var input = document.getElementById("input");
    var reader = new FileReader();
    reader.onload = function(){
        var fileData = reader.result;
        fileData = fileData.split("\n");
    };
}