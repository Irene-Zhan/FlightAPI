var root_url = "http://comp426.cs.unc.edu:3001/";

$(document).ready(() => {
    $('#login_btn').on('click', login_handler);
	$('#create_new').on('click', () => {
        create_new();
    }); 
});

// let old_depart;
// let old_arrive;

var flight_interface = function(){
	let body = $('body');
	body.empty();
	let account_div = $('<nav class="navbar"></nav>');
	let account_span = $('<span></span>');
	account_span.append('<i class="fas fa-user"></i>');
	let account_btn = $('<button id="account">my account</button>');
	account_span.append(account_btn);
	account_div.append(account_span);
	account_btn.on("click", my_account);
	let logout_btn=$('<button type="button" id="logout">log out</button>');
	account_div.append(logout_btn);
	logout_btn.on("click", goBackHandler);
	body.append(account_div);
	body.append('<div id="location"><div>');
	/*
	$('#location').append('<form autocomplete="off" action="/action_page.php" id="dform"></form>');
	$('#dform').append('<div class="autocomplete" id= "ddiv" style="width:300px;"></div>');
	$('#ddv').append('<input type="text" name="depart" id="depart" placeholder="Depart">')
	$('#dform').append('<input type="submit">');
	*/
	$('#location').append('<span id="depart_span">Flying from: </span>');
	$('#depart_span').append('<input id="depart">');
	
	$('#depart').autocomplete({
		source:us_cities,
		messages: {
			noResults: '',
			results: function() {}
		}
	});

	$('#location').append('<span id="arrive_span">Flying to: </span>');
	$('#arrive_span').append('<input type="text" id="arrive">');
	$('#arrive').autocomplete({
		source:us_cities,
		messages: {
			noResults: '',
			results: function() {}
		}
	});
	$('#location').append('<span id="departing_span">Departing: </span>');
	$('#departing_span').append('<input type="date" id="departing">');
	$('#location').append('<span id="arriving_span">Returning: </span>');
	$('#arriving_span').append('<input type="date" id="arriving">');
	$('#location').append('<span id="traveler_span">Number of Travelers: </span>');
	$('#traveler_span').append('<input type="text" id="num_pass">');
	$('#location').append('<span id="round_span"><input type="checkbox" id="roundtrip" name="roundtrip" value="Roundtrip" />Roundtrip</span>');
	let search_btn=$('<button type="button" id="search">Search</button>');
	body.append(search_btn);
	// old_depart=$('#depart').val();
	// old_arrive =$('#arrive').val();
	search_btn.on("click", search);
	body.append('<div id="results"></div>');
};

var search = function(){
	// let depart=$('#depart').val();
	// let arrive=$('#arrive').val();
	// old_depart = depart;
	// old_arrive = arrive;
	$('#results').empty();
	$('#noresult').empty();
	$('#returning_text').remove();
	$('#depart_result').remove();
	if($('.book').length != 0){
		$('.book').empty();
	}
	search_ajax('city');
	search_ajax('code');
	search_ajax('name');
	$('.result').on('click', book_interface);
};

var search_ajax = function(filter_string){
	let depart=$('#depart').val();
	let arrive=$('#arrive').val();
	let departing=$('#departing').val();
	let arriving=$('#arriving').val();
	let depart_ids = new Array();
	let arrive_ids = new Array();
	let airlines=[];
	let flights = [];
	let instances = [];
	let count = 0;
	
	$.ajax(root_url+'airports?'+'filter[' + filter_string+ ']='+depart,
	{
		type: 'GET',
		dataType: 'json',
		xhrFields: { withCredentials: true },
		success: (a) => {
				for(i=0; i<a.length; i++){
					depart_ids.push(a[i].id);	 
				 }

				 $.ajax(root_url+'airports?' + 'filter[' + filter_string+ ']='+arrive,
				 {
				  type: 'GET',
				  dataType: 'json',
				  xhrFields: { withCredentials: true },
				  
				 success: (b) => {
				   for(i=0; i<b.length; i++){
					  arrive_ids.push(b[i].id); 
				   }

				   for(let i=0; i<depart_ids.length; i++){
					   for(let j=0; j<arrive_ids.length; j++){
						   $.ajax(root_url+'flights?'+'filter[departure_id]='+depart_ids[i]+'&filter[arrival_id]='+arrive_ids[j],
						   {
							   type: 'GET',
							   dataType: 'json',
							   xhrFields: { withCredentials: true },
							   
							  success: (c) => {
							//	  flights=[];
								  for(let l=0; l<c.length;l++){
									  flights.push(c[l]);
								  }

								for(let k=0; k<flights.length; k++){
								   //write flight airline name+number+depart+arrive+date
									   $.ajax(root_url+'airlines/'+flights[k].airline_id,
									  {
									   type: 'GET',
									   dataType: 'json',
									   xhrFields: { withCredentials: true },
									   
									  success: (d) => {
										  
										  $.ajax(root_url+'instances?'+'filter[flight_id]='+flights[k].id,
										  {
											type: 'GET',
									   		dataType: 'json',
											xhrFields: { withCredentials: true },
											
											success:(e)=> {
												//create instances array
												instances[k]=[];
											//	console.log(flights[k].id);
												//put all instances with same flight_id
												for(let m=0; m<e.length;m++){
													instances[k].push(e[m]);
												}

												
											
												for(let n=0; n<instances[k].length; n++){
												//	console.log(k);
												
											//	console.log(e);
												let date = instances[k][n].date;
												if(date != departing && departing != ""){													
													continue;
												}
												count++;
												
												
												
											//	console.log(date);
												let time = flights[k].departs_at.substring(11,20);
												let ti = flights[k].arrives_at.substring(11,20);
												var ary1=time.split(':'),ary2=ti.split(':');
												//secdiff is the duration in seconds
												let secdiff=parseInt(ary2[0],10)*3600+parseInt(ary2[1],10)*60+parseInt(ary2[2],10)-parseInt(ary1[0],10)*3600-parseInt(ary1[1],10)*60-parseInt(ary1[2],10);
												if(secdiff < 0){
													secdiff = secdiff+12*3600;
												}
												let hourdiff=parseInt(secdiff/3600);
												let price =  Math.floor(Math.random()*(150-90)+90)*hourdiff;
												//duration is in time format
												let duration = String(100+Math.floor(secdiff/3600)).substr(1)+':'+String(100+Math.floor((secdiff%3600)/60)).substr(1)+':'+String(100+secdiff%60).substr(1);
												
												var newResult = $('<div class="result" id="search_'+k+'" plane_id='+flights[k].plane_id+' price='+price+'>'+'<p class="airline">'+d.name+' '+flights[k].number+'</p><p>'
												+'Departs from: '+depart+'	on '+date+' at '+time
												+' Arrives at: '+arrive+'	on '+date+' at '+ti+'</p><p>'+'Duration: '+duration+'</p>'
												+'<p>Price: $'+price+'</p></div>');
												$('#results').append(newResult);
												if($('#roundtrip').is(':checked')){
													newResult.on('click', search_round);
												}else{
													newResult.on('click',book_interface);
												}
												}//end of for loop of n											
												if(count==0 && k==flights.length-1 && $('#noresult').length==0){//
													
													var  noresult = $('<div id="noresult">There is no flight for the departing date. Please choose another.</div>');
													$('#results').append(noresult);
												}
											}//end of success(e)
										});
									   },
									  error: () => {
										  alert("airline_name");
									   
									  }
									  
								   });
							   
								}//end of for loop of k
								
							  },//end of success(c)
							  error: () => {
								  alert("flights");						
							  }					   
						   });//end of ajax for flights
			   
					   }//end of for loop of j
				   }//end of for loop of i
									 }//end of success(b)
									   
									 });
									},//end of success a
								   error: () => {
									   alert("airline_name");									
								   }								   
								});						 

}
var search_round = function(){
	var depart_result = $(this);
	$('#results').empty();
	$('#noresult').empty();
	$('#returning_text').remove();
	$('#depart_result').remove();
	$('<p id="depart_result" ></p>').insertBefore('#results');

/*	if($('.book').length != 0){
		$('.book').empty();
	}*/
	$('#depart_result').append(depart_result);
	$('#depart_result').append('<p id="returning_text">Returning Flights: </p>');
	search_ajax_round('city', depart_result);
	search_ajax_round('code', depart_result);
	search_ajax_round('name', depart_result);

}
var search_ajax_round = function(filter_string){
//	var depart_result = $(this);//save departing flight	
	let depart=$('#arrive').val();
	let arrive=$('#depart').val();
	let departing=$('#arriving').val();
	let arriving=$('#departing').val();
	let depart_ids = new Array();
	let arrive_ids = new Array();
	let airlines=[];
	let flights = [];
	let instances = [];
	let count = 0;

	$.ajax(root_url+'airports?'+'filter[' + filter_string+ ']='+depart,
	{
		type: 'GET',
		dataType: 'json',
		xhrFields: { withCredentials: true },
		success: (a) => {
				for(i=0; i<a.length; i++){
					depart_ids.push(a[i].id);	 
				 }

				 $.ajax(root_url+'airports?' + 'filter[' + filter_string+ ']='+arrive,
				 {
				  type: 'GET',
				  dataType: 'json',
				  xhrFields: { withCredentials: true },
				  
				 success: (b) => {
				   for(i=0; i<b.length; i++){
					  arrive_ids.push(b[i].id); 
				   }

				   for(let i=0; i<depart_ids.length; i++){
					   for(let j=0; j<arrive_ids.length; j++){
						   $.ajax(root_url+'flights?'+'filter[departure_id]='+depart_ids[i]+'&filter[arrival_id]='+arrive_ids[j],
						   {
							   type: 'GET',
							   dataType: 'json',
							   xhrFields: { withCredentials: true },
							   
							  success: (c) => {
								  for(let l=0; l<c.length;l++){
									  flights.push(c[l]);
								  }

								for(let k=0; k<flights.length; k++){
								   //write flight airline name+number+depart+arrive+date
									   $.ajax(root_url+'airlines/'+flights[k].airline_id,
									  {
									   type: 'GET',
									   dataType: 'json',
									   xhrFields: { withCredentials: true },
									   
									  success: (d) => {
										  //add to airlines name, write filter
								//		if(airlines.indexOf(d.name)!=-1){airlines.push(d.name);}
										//  console.log(flights[k].id);
										  $.ajax(root_url+'instances?'+'filter[flight_id]='+flights[k].id,
										  {
											type: 'GET',
									   		dataType: 'json',
											xhrFields: { withCredentials: true },
											
											success:(e)=> {
												//create instances array
												instances[k]=[];
											//	console.log(flights[k].id);
												//put all instances with same flight_id
												for(let m=0; m<e.length;m++){
													instances[k].push(e[m]);
												}
												for(let n=0; n<instances[k].length; n++){
												//	console.log(k);
												
											//	console.log(e);
												let date = instances[k][n].date;
												if(date != departing && departing != ""){													
													continue;
												}
												if(departing =="" && date <= arriving){
													continue;
												}
												count++;
												
												
												
											//	console.log(date);
												let time = flights[k].departs_at.substring(11,20);
												let ti = flights[k].arrives_at.substring(11,20);
												var ary1=time.split(':'),ary2=ti.split(':');
												//secdiff is the duration in seconds
												let secdiff=parseInt(ary2[0],10)*3600+parseInt(ary2[1],10)*60+parseInt(ary2[2],10)-parseInt(ary1[0],10)*3600-parseInt(ary1[1],10)*60-parseInt(ary1[2],10);
												if(secdiff < 0){
													secdiff = secdiff+12*3600;
												}
												let hourdiff=parseInt(secdiff/3600);
												
												let price =  Math.floor(Math.random()*(150-90)+90)*hourdiff;
												//duration is in time format
												let duration = String(100+Math.floor(secdiff/3600)).substr(1)+':'+String(100+Math.floor((secdiff%3600)/60)).substr(1)+':'+String(100+secdiff%60).substr(1);
												
												var newResult = $('<div class="result" id="search_'+k+'" plane_id='+flights[k].plane_id+' price='+price+'>'+'<p class="airline">'+d.name+' '+flights[k].number+'</p><p>'
												+'Departs from: '+depart+'	on '+date+' at '+time
												+' Arrives at: '+arrive+'	on '+date+' at '+ti+'</p><p>'+'Duration: '+duration+'</p>'
												+'<p>Price: $'+price+'</p></div>');
												$('#results').append(newResult);
												newResult.on('click',book_interface);
												
												}//end of for loop of n
												if(count==0 && k==flights.length-1 && $('#noresult').length==0){//
													var  noresult = $('<div id="noresult">There is no flight for the returning date. Please choose another.</div>');
													$('#results').append(noresult);
												}
											}
										  
										
										
										
										});
									   },//end of success(d)
									  error: () => {
										  alert("airline_name");
									   
									  }
									  
								   });
							   
								}//end of for loop of k
								
							  },//end of success(c)
							  error: () => {
								  alert("flights");						
							  }					   
						   });//end of ajax for flights
			   
					   }//end of for loop of j
				   }//end of for loop of i
								 
				},//end of success(b)
								   error: () => {
									   alert("airline_name");
									
								   }
								   
								});
		},//end of success(a)						
	});
}
var book_interface = function(){
	var depart_booked = $('#depart_result');
	var resultbooked = $(this);
	let plane_id = $(this).attr("plane_id");
	let pass_num = $('#num_pass').val();
	if(pass_num.length == 0){
		pass_num = 1;
	}
	$('body').empty();
	let navbar = $('<nav class="navbar"></nav>');
	$('body').append(navbar);
	let account_span = $('<span></span>');
	account_span.append('<i class="fas fa-user"></i>');
	let account_btn = $('<button id="account">my account</button>');
	account_span.append(account_btn);
	navbar.append(account_span);
	account_btn.on("click", my_account);
	let return_btn = $('<button id="return">Return</button>');
	navbar.append(return_btn);
	return_btn.on("click", flight_interface);
	let logout_btn=$('<button type="button" id="logout">log out</button>');
	logout_btn.on("click", goBackHandler);
	navbar.append(logout_btn);
	$('body').append('<div id="flight_booked"></div>');
	$('#flight_booked').append(depart_booked);
	$('#flight_booked').append(resultbooked);
//	var totalPrice = parseInt(depart_booked.attr("price"))+parseInt(resultbooked.attr("price"));
//	console.log(totalPrice);
//	$('#flight_booked').append('<p>Total Price:'+totalPrice+'</p>');	
	$('#flight_booked').attr("plane_id", plane_id);

//	console.log($('#flight_booked'));
	let book_page = $('<div class="book"></div>');
	$('body').append(book_page);
	for(let i=0; i<pass_num; i++){
		let q = i+1;
		book_page.append('<h2> Passenger ' +q+'</h2>');
		info_page(book_page,i);
	}
	book_page.append('<div id="booking"> </div>');
	$('#booking').append('<button class="submit_book">Confirm Booking</button>');
	$('.submit_book').on('click', booked);
}



var booked = function(){
	let $first = $('.firstName');
	let first = [];
	let $middle = $('.middleName');
	let middle = [];
	let $last = $('.lastName');
	let last = [];
	let $age = $('.age_input');
	let a = [];
	let gen = [];
	for(let i=0; i<$first.length; i++){
		if($($first[i]).val() == ""){
			alert("you must fill all fields start with *")
			return;
		}
		if($($last[i]).val() == ""){
			alert("you must fill all fields start with *")
			return;
		}
		if($($age[i]).val() == ""){
			alert("you must fill all fields start with *")
			return;
		}
		if($('input[name="gender_' + i+'"]:checked').val() == null){
			alert("you must fill all fields start with *")
			return;
		}
		first.push($($first[i]).val());
		middle.push($($middle[i]).val());
		last.push($($last[i]).val());
		a.push(parseInt($($age[i]).val()));
		gen.push($('input[name="gender_' +i+'"]:checked').val());
	}

	let round = 1;
	let flight_booked = $('#flight_booked');
	let divs = flight_booked.find('.result');
	if(divs.length == 2){
		round=2;
	}
	let plane_id = [];
	for(let k=0; k<divs.length; k++){
		plane_id.push(parseInt($(divs[k]).attr("plane_id")));
	}
	//parseInt($('#flight_booked').attr("plane_id"));
	let info = $('#flight_booked').html();
	let all_info = info.split('</div>');
	let qw = all_info[0].split('<p id="depart_result"></p>');
	all_info[0] = qw;
	let response = [];
	let j=0;
	let body = $('body');
	if(divs.length>1){
		let f_count = 0;
		let t_count = 0;
		let q =0;
	for(let p=0;p<first.length*round;p++){
		$.ajax(root_url+'seats?filter[plane_id]='+plane_id[q]+'&filter[cabin]=Economy',
		{
		 type: 'GET',
		 xhrFields: { withCredentials: true },
		success: (seats) => {
			q++;
			if(f_count%2 == 0){ q = 0 };
			let seat_index = Math.floor((Math.random() * seats.length));
			let seat = seats[seat_index].id;
			let flight_info = all_info[q]+'<p>'+seats[seat_index].cabin+' '+seats[seat_index].row+seats[seat_index].number+'</p></div>';
			let ppl = Math.floor(f_count/2);
			f_count++;
			if(middle[ppl].length != 0){
				$.ajax(root_url+'tickets',
				{
				 type: 'POST',
				 xhrFields: { withCredentials: true },
				 data:{
					ticket: {
					   first_name: first[ppl],
					   middle_name: middle[ppl],
					   last_name: last[ppl],
					   age: a[ppl],
					   gender: gen[ppl],
					   instance_id: plane_id[q],
					   seat_id: seat,
					   info: flight_info
					}
				 },
				success: (z) => {
					response.push(z);
					$('.book').empty();
					if(t_count%2 == 0){
						let e = response[t_count].middle_name.substring(0,1).toUpperCase();
						body.append($('<p class="for">For Passenger: '+response[t_count].first_name+' '+e+'. '+response[t_count].last_name+'</p>'));
						let ticket_div = $('<div class="ticket" id = "ticket_'+response[t_count].id+'"></div>');
						ticket_div.append('<p>Ticket Confirmation</p>');
						let zx = response[t_count].info.split('<p class="airline">')
						let piao = '<div><p class="name">'+response[t_count].first_name+' '+e+'. '+response[t_count].last_name+'</p><p class="airline">' + zx[1];
						ticket_div.append(piao);
						body.append(ticket_div);
						t_count++;
					}else{
						let ticket_div = $('<div class="ticket" id = "ticket_'+response[t_count].id+'"></div>');
						ticket_div.append('<p>Ticket Confirmation</p>');
						let e = response[t_count].middle_name.substring(0,1).toUpperCase();
						let zx = response[t_count].info.split('<p class="airline">')
						let piao = '<div><p class="name">'+response[t_count].first_name+' '+e+'. '+response[t_count].last_name+'</p><p class="airline">' + zx[1];
						ticket_div.append(piao);
						body.append(ticket_div);
						t_count++;
					}
					

				},
			 });
			}else{
				$.ajax(root_url+'tickets',
				{
				 type: 'POST',
				 xhrFields: { withCredentials: true },
				 data:{
					ticket: {
					   first_name: first[ppl],
					   last_name: last[ppl],
					   age: a[ppl],
					   gender: gen[ppl],
					   instance_id: plane_id[q],
					   seat_id: seat,
					   info: flight_info
					}
				 },
				success: (z) => {
					response.push(z);
					$('.book').empty();
					if(t_count%2 == 0){
						body.append($('<p class="for">For Passenger: '+response[t_count].first_name+' '+response[t_count].last_name+'</p>'));
						let ticket_div = $('<div class="ticket" id = "ticket_'+response[t_count].id+'"></div>');
						ticket_div.append('<p>Ticket Confirmation</p>');
						let zx = response[t_count].info.split('<p class="airline">')
						let piao = '<div><p class="name">'+response[t_count].first_name+' '+response[t_count].last_name+'</p><p class="airline">' + zx[1];
						ticket_div.append(piao);
						body.append(ticket_div);
						t_count++;
					}else{
						let ticket_div = $('<div class="ticket" id = "ticket_'+response[t_count].id+'"></div>');
						ticket_div.append('<p>Ticket Confirmation</p>');
						let zx = response[t_count].info.split('<p class="airline">')
						let piao = '<div><p class="name">'+response[t_count].first_name+' '+response[t_count].last_name+'</p><p class="airline">' + zx[1];
						ticket_div.append(piao);
						body.append(ticket_div);
						t_count++;
					}

				},
			 });
			}


		},
	 });

	}
}else{
	for(let i=0;i<first.length*round;i++){
		$.ajax(root_url+'seats?filter[plane_id]='+plane_id+'&filter[cabin]=Economy',
		{
		 type: 'GET',
		 xhrFields: { withCredentials: true },
		success: (seats) => {
			let seat_index = Math.floor((Math.random() * seats.length));
			let seat = seats[seat_index].id;

			let flight_info = info.split('</div>');
			flight_info = flight_info+'<p>'+seats[seat_index].cabin+' '+seats[seat_index].row+seats[seat_index].number+'</p>'+'</div>';
			if(middle[i].length != 0){
				
				$.ajax(root_url+'tickets',
				{
				 type: 'POST',
				 xhrFields: { withCredentials: true },
				 data:{
					ticket: {
					   first_name: first[i],
					   middle_name: middle[i],
					   last_name: last[i],
					   age: a[i],
					   gender: gen[i],
					   instance_id: plane_id,
					   seat_id: seat,
					   info: flight_info
					}
				 },
				success: (z) => {
					response.push(z);
					$('.book').empty();
					let e = response[j].middle_name.substring(0,1).toUpperCase();
					body.append($('<p class="for">For Passenger: '+response[j].first_name+' '+e+'. '+response[j].last_name+'</p>'));					
					let ticket_div = $('<div class="ticket" id = "ticket_'+response[j].id+'"></div>');
					ticket_div.append('<p>Ticket Confirmation</p>');
					let zx = response[j].info.split('<p class="airline">');
					zx = zx[1].split(',');
					let piao = '<div><p class="name">'+response[j].first_name+' '+e+'. '+response[j].last_name+'</p><p class="airline">' + zx[0]+zx[1];
					ticket_div.append(piao);
					body.append(ticket_div);
					j++;
				},
			 });

			}else{
				$.ajax(root_url+'tickets',
				{
				 type: 'POST',
				 xhrFields: { withCredentials: true },
				 data:{
					ticket: {
					   first_name: first[i],
					   last_name: last[i],
					   age: a[i],
					   gender: gen[i],
					   instance_id: plane_id,
					   seat_id: seat,
					   info: flight_info
					}
				 },
				success: (z) => {
					response.push(z);
					$('.book').empty();
					body.append($('<p class="for">For Passenger: '+response[j].first_name+' '+response[j].last_name+'</p>'));
					let ticket_div = $('<div class="ticket" id = "ticket_'+response[j].id+'"></div>');
					ticket_div.append('<p>Ticket Confirmation</p>');
					let zx = response[j].info.split('<p class="airline">');
					zx = zx[1].split(',');
					let piao = '<div><p class="name">'+response[j].first_name+' '+response[j].last_name+'</p><p class="airline">' + zx[0]+zx[1];
					ticket_div.append(piao);
					body.append(ticket_div);
					j++;
				},
			 });
			}
			$.ajax(root_url + 'seats/'+seat,
			{
				type: 'PUT',
				xhrFields: {withCredentials: true},
				data:{
					seat: {
					   info: "sold"
					}
				 },
				success: (z) => {
				},
				error: () => {
				}
				});


		},
	 });


	}
}
};

var my_account = function(){
	let body = $('body');
	body.empty();
	let username;
	let navbar = $('<nav class="navbar" id="account_return"></nav>');
	body.append(navbar);
	let return_btn = $('<button class="return">return</button>');
	return_btn.on("click",flight_interface);
	navbar.append(return_btn);
	let logout_btn=$('<button type="button" id="logout">log out</button>');
	logout_btn.on("click", goBackHandler);
	navbar.append(logout_btn);
	//let navbar_2 = $('<div class="navbar" id="account_logout"></div>');
	//body.append(navbar_2);
	
	//let pass_div = $('<div class="navbar"id="pass_div"></div');
	let pass_btn = $('<button>change password</button>');
	pass_btn.on("click",change_pass_interface);
	navbar.append(pass_btn);

	//body.append(pass_div);


	
	$.ajax(root_url + 'users',
	{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (user_info) => {
			username = user_info.username;
			body.append('<h1 id="welcome"> Welcome Back, ' +username+ '!</h1>');
			body.append('<p id="helper">These are all the tickets you have purchased, click the according buttons to cancel your tickets or change your seats</p>');
			body.append($('<div class="msg"></div>'));
			pass_btn.on("click",change_pass_interface);
			$.ajax(root_url + 'tickets',
			{
			type: 'GET',
			dataType: 'json',
			xhrFields: {withCredentials: true},
			success: (response) => {
				if(response.length == 0){
					$('.msg').html("You have not booked any tickets yet");
					return;
				}
				for(let j=0;j<response.length; j++){
					if(response[j].middle_name == null){
						let ticket_div = $('<div class="ticket" id="ticket_'+response[j].id+'"></div>');
						ticket_div.append('<p>Ticket Confirmation</p>');
						body.append(ticket_div);
						//ticket_div.append($('<p>Name of Passenger: '+response[j].first_name+' '+response[j].last_name+'</p>'));
						
						let zx = response[j].info.split('<p class="airline">')
						zx = zx[1].split(',');
						let piao;
						if(zx.length >1){
							piao = '<div><p class="name">'+response[j].first_name+' '+response[j].last_name+'</p><p class="airline">' + zx[0]+zx[1];

						}else{
							piao = '<div><p class="name">'+response[j].first_name+' '+response[j].last_name+'</p><p class="airline">' + zx;
						}
						//let piao = '<div><p class="name">'+response[j].first_name+' '+response[j].last_name+'</p><p class="airline">' + zx[1];
						ticket_div.append(piao);
						//ticket_div.append(response[j].info);
						let delete_btn=$('<button type="button" class="delete">cancel ticket</button>');
						ticket_div.append(delete_btn);
						delete_btn.on("click", cancel_ticket);
						let seat_btn=$('<button type="button" class="seat">change seat</button>');
						ticket_div.append(seat_btn);
						seat_btn.on("click", seat_interface);
					}else{
						let ticket_div = $('<div class="ticket" id="ticket_'+response[j].id+'"></div>');
						ticket_div.append('<p>Ticket Confirmation</p>');
						body.append(ticket_div);
						let e = response[j].middle_name.substring(0,1).toUpperCase();
						
						let zx = response[j].info.split('<p class="airline">')
						//let zx = response[j].info.split('<p class="airline">');
						zx = zx[1].split(',');
						let piao
						if(zx.length > 1){
							piao = '<div><p class="name">'+response[j].first_name+' '+e+'. '+response[j].last_name+'</p><p class="airline">' + zx[0]+zx[1];

						}else{
							piao = '<div><p class="name">'+response[j].first_name+' '+e+'. '+response[j].last_name+'</p><p class="airline">' + zx[0];

						}

						
						ticket_div.append(piao);
						//let piao = '<div><p class="name">'+response[j].first_name+' '+e+'. '+response[j].last_name+'</p><p class="airline">' + zx[1];
						//ticket_div.append(piao);			
					
						//ticket_div.append(response[j].info);
						let delete_btn=$('<button type="button" class="delete">cancel ticket</button>');
						ticket_div.append(delete_btn);
						delete_btn.on("click", cancel_ticket);
						let seat_btn=$('<button type="button" class="seat">change seat</button>');
						ticket_div.append(seat_btn);
						seat_btn.on("click", seat_interface);
					}
				}
			},
			error: () => {
				alert('ff');
			}
			});


		}
		});

};

let e=0;
var seat_interface = function(){
	//let $ticket = $('.ticket');
	let ticket_div = $(this).parent('.ticket');
	let navbar = $(ticket_div).siblings('.button');
	navbar.empty();
	let return_btn = $('<button class="return">return</button>');
	return_btn.appendTo(navbar);
	return_btn.on("click",my_account);
	// for(let i=0; i<$ticket.length; i++){
	// 	if($($ticket[i]).attr("id") != $(ticket_div).attr("id")){
	// 		$($ticket[i]).empty();
	// 	}
	// }
	let seat_div = $('<div class="seat"></div>');
	ticket_div.append(seat_div);
	
	seat_div.append($('<div class="cabin" id="cabin_'+e+'">Cabin: </div>'));
	$('#cabin_'+e).append('<input type="radio" id="first_'+e+'" value="First" name="cabin_'+e+'">');
	$('#cabin_'+e).append('<label for="first_'+e+'">First Class</label>');
	$('#cabin_'+e).append('<input type="radio" id="business_'+e+'" value="Business" name="cabin_'+e+'">');
	$('#cabin_'+e).append('<label for="business_'+e+'">Business</label>');
	$('#cabin_'+e).append('<input type="radio" id="economy_'+e+'" value="Economy" name="cabin_'+e+'">');
	$('#cabin_'+e).append('<label for="economy_'+e+'">Economy</label>');
	seat_div.append($('<div class="location" id="location_'+e+'"></div>'));
	$('#location_'+e).append('<input type="radio" id="aisle_'+e+'" value="aisle" name="location_'+e+'">');
	$('#location_'+e).append('<label for="aisle_'+e+'">Next to Aisle</label>');
	$('#location_'+e).append('<input type="radio" id="window_'+e+'" value="window" name="location_'+e+'">');
	$('#location_'+e).append('<label for="window_'+e+'">Next to Window</label>');
	$('#location_'+e).append('<input type="radio" id="neither_'+e+'" value="neither" name="location_'+e+'">');
	$('#location_'+e).append('<label for="neither_'+e+'">Neither</label>');
	let seat_btn=$('<button type="button" class="seat">submit your changes</button>');
	seat_div.append(seat_btn);
	seat_btn.on("click", change_seat);
	e++;
}

var change_seat = function(){
	let seat_div = $(this).parent('.seat');
	let cabin_div = $(seat_div).find('.cabin');
	let cabin_id = $(cabin_div).attr("id");
	let cabin = $('input[name="'+cabin_id+'"]:checked').val();
	let loc_div = $(seat_div).find('.location');
	let loc_id = $(loc_div).attr("id");
	let location = $('input[name="'+loc_id+'"]:checked').val();

	let window, aisle;
	if(location == "window"){
		window = true;
		aisle = false;
	}else if(location == "aisle"){
		window = false;
		aisle = true;
	}else{
		window = false;
		aisle = false;
	}
	let ticket_div = $(seat_div).parent('.ticket');
	let ticket_id = parseInt($(ticket_div).attr("id").replace( /^\D+/g, ''));
	$.ajax(root_url + 'tickets/'+ticket_id,
	{
		type: 'GET',
		xhrFields: {withCredentials: true},
		success: (a) => {

			$.ajax(root_url + 'seats?filter[plane_id]='+a.instance_id +'&filter[cabin]='+cabin,
			{
				type: 'GET',
				xhrFields: {withCredentials: true},
				success: (seats) => {
					let seat = 0;
					
					for(let x=0; x<seats.length; x++){
						if(seats[x].is_window == window && seats[x].is_aisle == aisle && seats[x].info != "sold"){
							seat = seats[x];
							break;
						}
					}
					if(seat == 0){
						alert("Sorry, there are no more tickets fulfilling your preferences.");
						my_account();
						return;
					}
					$.ajax(root_url + 'seats/'+seat.id,
					{
						type: 'PUT',
						xhrFields: {withCredentials: true},
						data:{
							seat: {
							   info: "sold"
							}
						 },
						success: (z) => {
						},
						error: () => {
						}
						});
						$.ajax(root_url + 'seats/'+a.seat_id,
						{
							type: 'PUT',
							xhrFields: {withCredentials: true},
							data:{
								seat: {
								   info: "available"
								}
							 },
							success: (z) => {
							},
							error: () => {
							}
							});	
					let a_info = a.info.split("Economy");
					if(a_info.length != 2){
						a_info = a.info.split("First");
					}
					let info = a_info[0]+seat.cabin+' '+seat.row+seat.number;
					$.ajax(root_url + 'tickets/'+ticket_id,
					{
						type: 'PUT',
						xhrFields: {withCredentials: true},
						data:{
							ticket: {
							   first_name: a.first_name,
							   last_name: a.last_name,
							   age: a.age,
							   gender: a.gender,
							   instance_id: a.instance_id,
							   seat_id: seat.id,
							   info: info
							}
						 },
						success: (a) => {
							$('.body').empty();
							$('.body').append($('<div class="msg"></div>'));
							alert("Your seat has been changed successfully, going back to your account home page");
							my_account();
						},
						error: () => {
							alert('meow');
						}
						});

				},
				error: () => {
					alert('meow');
				}
				});
		},
		error: () => {
			alert('meow');
		}
		});
	

}

var cancel_ticket = function(){
	let ticket_div = $(this).parent('.ticket');
	let ticket_id = parseInt($(ticket_div).attr("id").replace( /^\D+/g, ''));
	$.ajax(root_url + 'tickets/'+ticket_id,
	{
		type: 'DELETE',
		xhrFields: {withCredentials: true},
		success: (a) => {
			ticket_div.remove();
		},
		error: () => {
			alert('meow');
		}
		});
}

var change_pass_interface = function(){
	let body = $('body');
	body.empty();
	let navbar = $('<nav class="navbar"></nav>');
	let return_btn = $('<button>return</button>');
	navbar.append(return_btn);
	return_btn.on("click",my_account);
	let logout_btn=$('<button type="button" id="logout">log out</button>');
	logout_btn.on("click", goBackHandler);
	navbar.append(logout_btn);
	body.append(navbar);
	let container = $('<div class="container"></div>');
	body.append(container);
	container.append('<div class="pass" id="user_div">Username: </div>');
	$('#user_div').append('<input type="text" id="old_user">');
	container.append('<div class="pass" id="pass_div">Old Password: </div>');
	$('#pass_div').append('<input type="password" id="old_pass">');
	container.append('<div class="pass" id="new_pass_div">New Password: </div>');
	$('#new_pass_div').append('<input type="password" id="new_pass">');
	container.append('<div class="pass" id="new_pass_div_2">Confirm New Password: </div>');
	$('#new_pass_div_2').append('<input type="password" id="new_pass_2">');
	let pass_btn = $('<button>change password</button>');
	body.append(pass_btn);
	pass_btn.on("click",change_pass);
	body.append('<div id="pass_msg"></div>');
	body.append('<div id="pass_msg"></div>');

};

var info_page = function(book_page,i){
	book_page.append($('<span>*First Name:</span>'));
	book_page.append($('<input type="text" class="firstName" required="required">'));
	book_page.append($('<span>Middle Name:</span>'));
	book_page.append($('<input type="text" class="middleName">'));
	book_page.append($('<span>*Last Name:</span>'));
	book_page.append($('<input type="text" class="lastName" required="required"><br>'));
	book_page.append($('<div id="gender_' +i+'">*Gender: </div>'));
	$('#gender_'+i).append('<input type="radio" id="male" value="Male" name="gender_'+i+'">');
	$('#gender_'+i).append('<label for="male">Male</label>');
	$('#gender_'+i).append('<input type="radio" id="female" value="Female" name="gender_'+i+'">');
	$('#gender_'+i).append('<label for="female">Female</label>');
	book_page.append($('<span>*Age:</span>'));
	book_page.append($('<input type="text" class="age_input" required="required">'));
}

var change_pass = function(){
	let old_user = $('#old_user').val();
	let old_pass = $('#old_pass').val();
	let new_pass = $('#new_pass').val();
	let new_pass_2 = $('#new_pass_2').val();
	if(new_pass.localeCompare(new_pass_2) == 0){
		$.ajax(root_url + 'passwords',
		{
		type: 'PUT',
		xhrFields: {withCredentials: true},
		data: {
			user:{
			 username: old_user,
			 old_password: old_pass,
			 new_password: new_pass
			}
		},
		success: () => {
			$('#pass_msg').html("you have successfully changed your password. Returning to the login page");
			goBackHandler();
		},
		error: () => {
			if(old_user.length == 0){
				$('#pass_msg').html("you must enter your username");
			}else if(old_pass.length == 0 || new_pass.length == 0){
				$('#pass_msg').html("password cannot be empty");
			}else if(old_pass.length < 6 || new_pass.length < 6){
				$('#pass_msg').html("password has to be at least 6 digits");
			}
		}
		});
	}else{
		alert("you must confirm your new password")
	}
	
};

var create_new = function (){
    let body = $('body');

    body.empty();

    body.append('<h1>Create a new account</h1>');

    body.append('<div id="user">Username: </div>');
    $('#user').append('<input type="text" id="user_input">');

    body.append('<div id="pass">Password: </div>');
	$('#pass').append('<input type="password" id="pass_input">');
	let signup_btn = $('<button type="button" id="signUp">Sign Up</button>');

	body.append(signup_btn);
	signup_btn.on("click",signUpHandler); 

	
	let back_btn = $('<button type="button" id="login">Go Back to Login Page</button>');
	body.append(back_btn);
	back_btn.on("click",goBackHandler);
};

var signUpHandler = function(){
	let body = $('body');
	$('p').last().remove();

	let user=$('#user_input').val();
	let pass=$('#pass_input').val();
	
   
	$.ajax(root_url+'users',
	   {
		type: 'POST',
		xhrFields: { withCredentials: true },
		data:{
		   user: {
			  username: user,
			  password: pass
		   }
		},
		
	   success: () => {
		if(pass.length<6){
			alert('Password should be at least 6 characters.');
			return;
		}else{
			body.append('<p id="msg">Successfully create the account.</p>');

		}
	   },
	   error: () => {
		   if(user.length == 0 || pass.length == 0){
			body.append('<p id="msg">Username or password cannot be empty</p>');
		   }else{
			body.append('<p id="msg">Username has already been used. Try again.</p>');
		   }
		
	   }
	   
	});

};

var goBackHandler = function(){
	let body = $('body');
	body.empty();
	body.append('<h1>Welcome! Is this your first time at Book Your Flight?</h1>');
	body.append('<p>If so, please click "creat new account" to start your journey!</p>');
	body.append('<div id="user_login">Username: </div>');
	$('#user_login').append('<input type="text" id="user_input">');

	body.append('<div id="pass">Password: </div>');
	$('#pass').append('<input type="password" id="pass_input">');
	let login_btn = $('<button id="login_btn">Login</button>');
	let create_btn = $('<button id="create_new">Create New Account</button>');
	body.append(login_btn);
	body.append(create_btn);
	login_btn.on("click", login_handler);
	create_btn.on("click",create_new);
	body.append('<div id="mesg_div"></div>');

};

var login_handler = function(){
	let user = $('#user_input').val();
	let pass = $('#pass_input').val();

	$.ajax(root_url + 'sessions',
	       {
		   type: 'POST',
		   xhrFields: {withCredentials: true},
		   data: {
               user:{
                username: user,
                password: pass
               }
		   },
		   success: () => {
			   flight_interface();
		   },
		   error: () => {
			   if(user.length == 0 || pass.length == 0){
				   $('#mesg_div').html('username or password cannot be empty');
			   }else{
				$('#mesg_div').html('username and password do not match');
			   }
			   
		   }
		   });

		};
		   
	var us_cities = ["Aberdeen", "Abilene", "Akron", "Albany", "Albuquerque", "Alexandria", "Allentown", "Amarillo", "Anaheim", "Anchorage", "Ann Arbor", "Antioch", "Apple Valley", "Appleton", "Arlington", "Arvada", "Asheville", "Athens", "Atlanta", "Atlantic City", "Augusta", "Aurora", "Austin", "Bakersfield", "Baltimore", "Barnstable", "Baton Rouge", "Beaumont", "Bel Air", "Bellevue", "Berkeley", "Bethlehem", "Billings", "Birmingham", "Bloomington", "Boise", "Boise City", "Bonita Springs", "Boston", "Boulder", "Bradenton", "Bremerton", "Bridgeport", "Brighton", "Brownsville", "Bryan", "Buffalo", "Burbank", "Burlington", "Cambridge", "Canton", "Cape Coral", "Carrollton", "Cary", "Cathedral City", "Cedar Rapids", "Champaign", "Chandler", "Charleston", "Charlotte", "Chattanooga", "Chesapeake", "Chicago", "Chula Vista", "Cincinnati", "Clarke County", "Clarksville", "Clearwater", "Cleveland", "College Station", "Colorado Springs", "Columbia", "Columbus", "Concord", "Coral Springs", "Corona", "Corpus Christi", "Costa Mesa", "Dallas", "Daly City", "Danbury", "Davenport", "Davidson County", "Dayton", "Daytona Beach", "Deltona", "Denton", "Denver", "Des Moines", "Detroit", "Downey", "Duluth", "Durham", "El Monte", "El Paso", "Elizabeth", "Elk Grove", "Elkhart", "Erie", "Escondido", "Eugene", "Evansville", "Fairfield", "Fargo", "Fayetteville", "Fitchburg", "Flint", "Fontana", "Fort Collins", "Fort Lauderdale", "Fort Smith", "Fort Walton Beach", "Fort Wayne", "Fort Worth", "Frederick", "Fremont", "Fresno", "Fullerton", "Gainesville", "Garden Grove", "Garland", "Gastonia", "Gilbert", "Glendale", "Grand Prairie", "Grand Rapids", "Grayslake", "Green Bay", "GreenBay", "Greensboro", "Greenville", "Gulfport-Biloxi", "Hagerstown", "Hampton", "Harlingen", "Harrisburg", "Hartford", "Havre de Grace", "Hayward", "Hemet", "Henderson", "Hesperia", "Hialeah", "Hickory", "High Point", "Hollywood", "Honolulu", "Houma", "Houston", "Howell", "Huntington", "Huntington Beach", "Huntsville", "Independence", "Indianapolis", "Inglewood", "Irvine", "Irving", "Jackson", "Jacksonville", "Jefferson", "Jersey City", "Johnson City", "Joliet", "Kailua", "Kalamazoo", "Kaneohe", "Kansas City", "Kennewick", "Kenosha", "Killeen", "Kissimmee", "Knoxville", "Lacey", "Lafayette", "Lake Charles", "Lakeland", "Lakewood", "Lancaster", "Lansing", "Laredo", "Las Cruces", "Las Vegas", "Layton", "Leominster", "Lewisville", "Lexington", "Lincoln", "Little Rock", "Long Beach", "Lorain", "Los Angeles", "Louisville", "Lowell", "Lubbock", "Macon", "Madison", "Manchester", "Marina", "Marysville", "McAllen", "McHenry", "Medford", "Melbourne", "Memphis", "Merced", "Mesa", "Mesquite", "Miami", "Milwaukee", "Minneapolis", "Miramar", "Mission Viejo", "Mobile", "Modesto", "Monroe", "Monterey", "Montgomery", "Moreno Valley", "Murfreesboro", "Murrieta", "Muskegon", "Myrtle Beach", "Naperville", "Naples", "Nashua", "Nashville", "New Bedford", "New Haven", "New London", "New Orleans", "New York", "New York City", "Newark", "Newburgh", "Newport News", "Norfolk", "Normal", "Norman", "North Charleston", "North Las Vegas", "North Port", "Norwalk", "Norwich", "Oakland", "Ocala", "Oceanside", "Odessa", "Ogden", "Oklahoma City", "Olathe", "Olympia", "Omaha", "Ontario", "Orange", "Orem", "Orlando", "Overland Park", "Oxnard", "Palm Bay", "Palm Springs", "Palmdale", "Panama City", "Pasadena", "Paterson", "Pembroke Pines", "Pensacola", "Peoria", "Philadelphia", "Phoenix", "Pittsburgh", "Plano", "Pomona", "Pompano Beach", "Port Arthur", "Port Orange", "Port Saint Lucie", "Port St. Lucie", "Portland", "Portsmouth", "Poughkeepsie", "Providence", "Provo", "Pueblo", "Punta Gorda", "Racine", "Raleigh", "Rancho Cucamonga", "Reading", "Redding", "Reno", "Richland", "Richmond", "Richmond County", "Riverside", "Roanoke", "Rochester", "Rockford", "Roseville", "Round Lake Beach", "Sacramento", "Saginaw", "Saint Louis", "Saint Paul", "Saint Petersburg", "Salem", "Salinas", "Salt Lake City", "San Antonio", "San Bernardino", "San Buenaventura", "San Diego", "San Francisco", "San Jose", "Santa Ana", "Santa Barbara", "Santa Clara", "Santa Clarita", "Santa Cruz", "Santa Maria", "Santa Rosa", "Sarasota", "Savannah", "Scottsdale", "Scranton", "Seaside", "Seattle", "Sebastian", "Shreveport", "Simi Valley", "Sioux City", "Sioux Falls", "South Bend", "South Lyon", "Spartanburg", "Spokane", "Springdale", "Springfield", "St. Louis", "St. Paul", "St. Petersburg", "Stamford", "Sterling Heights", "Stockton", "Sunnyvale", "Syracuse", "Tacoma", "Tallahassee", "Tampa", "Temecula", "Tempe", "Thornton", "Thousand Oaks", "Toledo", "Topeka", "Torrance", "Trenton", "Tucson", "Tulsa", "Tuscaloosa", "Tyler", "Utica", "Vallejo", "Vancouver", "Vero Beach", "Victorville", "Virginia Beach", "Visalia", "Waco", "Warren", "Washington", "Waterbury", "Waterloo", "West Covina", "West Valley City", "Westminster", "Wichita", "Wilmington", "Winston", "Winter Haven", "Worcester", "Yakima", "Yonkers", "York", "Youngstown"];


	 

