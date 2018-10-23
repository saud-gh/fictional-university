import $ from 'jquery';

class Search{

	constructor(){
		this.addSearchHTML();
		this.resultDiv = $("#search-overlay__result");
		this.openButton = $(".js-search-trigger");
		this.closeButton = $(".search-overlay__close");
		this.searchOverlay = $(".search-overlay");
		this.searchField = $("#search-term");
		this.isOverlayOpen = false;
		this.isSpinnerVisible = false;
		this.typingTimer;
		this.prevValue;
		this.events();
	}

	events(){
		this.openButton.on("click", this.openOverlay.bind(this));
		this.closeButton.on("click", this.closeOverlay.bind(this));

		$(document).on("keydown", this.keyPressDispatcher.bind(this));

		this.searchField.on("keyup", this.typingLogic.bind(this));
	}

	getResults(){
		$.when(
			$.getJSON(uniData.root_url + '/wp-json/wp/v2/posts?search=' + this.searchField.val()),
			$.getJSON(uniData.root_url + '/wp-json/wp/v2/pages?search=' + this.searchField.val())
			).then(
				(posts, pages) => {
					var combinedResults = posts[0].concat(pages[0]);
					this.resultDiv.html(`
						<h2 class="search-overlay__section">General Information</h2>
						${combinedResults.length ? '<ul class="link-list min-list">' : '<p>No general information matches this</p>'}
						${combinedResults.map(item => `<li><a href="${item.link}">${item.title.rendered}</a> ${item.type=='post'? `by ${item.authorName}`: ''}</li>`).join('')}
						${combinedResults.length ? '</ul>' : ''}
					`);
					this.isSpinnerVisible = false;
				},
				() => { this.resultDiv.html('Unexpected error; please try again.')}
			);
	}

	typingLogic(){
		if (this.searchField.val() != this.prevValue) {
			clearTimeout(this.typingTimer);
			if(this.searchField.val()){
				if(!this.isSpinnerVisible){
					this.resultDiv.html('<div class="spinner-loader"></div>');
					this.isSpinnerVisible = true;
				}
				this.typingTimer = setTimeout(this.getResults.bind(this), 750);
			}else{
				this.resultDiv.html('');
				this.isSpinnerVisible = false;
			}
		}

		this.prevValue = this.searchField.val();
	}

	openOverlay(){
		this.searchOverlay.addClass("search-overlay--active");
		$("body").addClass("body-no-scroll");
		this,searchField.val('');
		setTimeout(() => this.searchField.focus(), 301);
		this.isOverlayOpen = true;
	}

	closeOverlay(){
		this.searchOverlay.removeClass("search-overlay--active");
		this.isOverlayOpen = false;
		$("body").removeClass("body-no-scroll");
	}

	keyPressDispatcher(e){
		console.log(e.keyCode);
		if(e.keyCode == 83 && !this.isOverlayOpen && !$("input, textarea").is(':focus'))
			this.openOverlay();
		else if (e.keyCode == 27 && this.isOverlayOpen)
			this.closeOverlay();
	}

	addSearchHTML(){
		$("body").append(`
			<div class="search-overlay">
			    <div class="search-overlay__top">
			      <div class="container">
			        <i class="fa fa-search search-overlay__icon" aria-hidden="true"></i>
			        <input type="text" class="search-term" id="search-term" placeholder="What are you looking for? ">
			        <i class="fa fa-window-close search-overlay__close" aria-hidden="true"></i>
			      </div>
			    </div>

			    <div class="container">
			      <div id="search-overlay__result"></div>
			    </div>
			</div>
		`);
	}

}

export default Search;