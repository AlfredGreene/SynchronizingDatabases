//Start synchronization when connection changes to "online"
window.addEventListener("online", function(e) {
          sync();
        }, false);

//deleting queries from table
function clearQueriesTable(db){
	db.transaction(
		function(t){
			t.executeSql("TRUNCATE TABLE queries", []);
		}
	);
}

// return an array: firt element is the number of queries, then there are pairs : query and array with parametres
function formatQueries(rows){
	var queries = [],
		query,
		params = [];

	queries.push(rows.length);
				 
	for (var i=0; i < rows.length; i++){
		query=rows.item(i).query;
		params=rows.item(i).param.split(",");

		queries.push(query);
		queries.push(params);					    						    
	} 
	return JSON.stringify(queries);
}

// synchronization of Local db with server db
function syncLocalToServer(db){
	var data;
	db.transaction(
	    function(t){	
	        t.executeSql("SELECT * FROM queries" ,[], function(t,r){		        				 
				data = formatQueries(r.rows);

				$.ajax(
			    {
			      type: 'post',
			      url: 'syncLocToServer.php',
			      data: {queries: data}
			    }).done(function(){
			    	clearQueriesTable(db); //deleting applied queries
			    });				 
			},
			function(t,e){alert(e.message);});			
		}
	);	
}

//gets json with queries older than sync_date from server
function syncServerToLocal(db){
	var last_sync_date=localStorage.getItem("last_sync");	
	var reload=false; // need to reload the page

	$.get( "syncServerToLoc.php?sync_date="+last_sync_date, function( data ) {
					var result = $.parseJSON(data); //1...n -> query,param
					if (result[0]!=0)
						reload=true;
					db.transaction(
						function(t){
							for(var i=0;i<result[0];i++){
								 t.executeSql(result[2*i+1], result[(i+1)*2]);
							}
						}
					);	 				
			} ).fail(function() {
	alert('Check your internet connection...')});

	if(reload)
		location.reload();
}


function sync(){
	var db = openDatabase("organiser", "1.0", "db for organiser", 4*1024*1024);	
	var id_user=$('body').attr('id');
	
	syncLocalToServer(db);
	
	syncServerToLocal(db);
  
	//   write to localStore time of synchronization		
	localStorage.setItem("last_sync",new Date().getTime() / 1000 +5| 0);	
}

//---FUNCTIONs FOR SAVING QUERY INTO SYNCHRONIZATION TABLE ()

function saveDataToLocalDB(query, parametres){
	db.transaction(
		function(t){
		 	t.executeSql("INSERT INTO queries (query,param) VALUES (?,?)", [query, parametres]);			 	
		}
	);
}

function saveDataToServerDB(query,parametres){
	var params = parametres.split(",");
	var array = [1,query,params];
	var stringed=JSON.stringify(array);
	
   		$.ajax(
		    {
		      type: 'post',
		      url: 'syncLocToServer.php',
		      data: {queries: stringed }
			})
				.done(function() {
			    localStorage.setItem("last_sync",new Date().getTime() / 1000 +10| 0);
			})
			.fail(function() {
			  	console.log("something wrong...writing to websql");
			    saveDataToLocalDB(query, parametres);
			}
		);
}

// writing query to synchronizaton table on server(if online) or in browser(if offline)
//for later synchronisations
//function is called from outside
function syncOperation(query,parametres){
	 if (navigator.onLine) {
	 	console.log('online...writing to mysql');
	 	saveDataToServerDB(query,parametres);
	 }else{
	 	console.log('im offline...writing to websql');
	 	saveDataToLocalDB(query, parametres);
	 }
}