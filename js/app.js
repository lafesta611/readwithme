Array.prototype.unique = function(){
	var a = {};

	for(var i=0; i <this.length; i++){
		if(typeof a[this[i]] == "undefined"){
			a[this[i]] = 1;	
		}
	}

	this.length = 0;

	for(var i in a){
		this[this.length] = i;
	}
	return this;
}

var ENTER_KEY = 13;
// Word 단어 모델
var Word = Backbone.Model.extend({
	defaults: {
		english: "",
		korean: "",
		selected: false,
		saved: false
	},

	select: function(){
		this.set({
			selected: !this.get('selected')
		});
	},

	toggle: function(){
		this.set({
			saved: !this.get('saved')
		});
	}
});

var ButtonView = Backbone.View.extend({
	el: '#save-btn',
	template: $('#buttonTemplate').html(),
	render: function(){
		var tmpl = _.template(this.template);

		this.$el.html(tmpl());
		return this;
	}
});

var FrameView = Backbone.View.extend({
	model: Word,
	el: "#iframe",
	template: $("#searchTemplate").html(),

	render: function(){
		var tmpl = _.template(this.template);

		this.$el.html(tmpl(this.model.toJSON()));
		return this;
	}
});

// Word View
var WordView = Backbone.View.extend({
	model: Word,
	tagName: "li",
	template: $("#wordTemplate").html(),

	initialize: function(){
		this.$iframe = this.$('.iframe');
		this.model.on('change', this.render, this);
	},

	events:{
		"click #word" : "search",
		"click .check" : "toggleSaved",
		"blur #korean-text" : "koreanSave"
	},

	render: function(){
		var tmpl = _.template(this.template);		

		this.$el.html(tmpl(this.model.toJSON()));
		return this;
	},

	search: function(){
		if(!this.model.get('selected')){
			console.log(this.model.get('english'));
			var frameView = new FrameView({model: this.model});
			this.$iframe.append(frameView.render().el);	
			// window.open("http://dic.naver.com/search.nhn?query=" + this.model.get("english"));	
		}
		this.model.select();
		this.render();
	},

	toggleSaved:function(){
		this.model.toggle();
	},

	koreanSave: function(){
		var koreanText = this.$('#korean-text').val().trim();
		
		if(!koreanText){
			this.model.select();
			return;
		}

		this.model.set({korean:koreanText});	

		console.log(this.model.get('korean'));
	}
});

// Collection
var WordList = Backbone.Collection.extend({
	model: Word,

	addAll: function(words){
		for(var i=0; i < words.length; i++){
			console.log(words[i]);
			if(words[i]){
				this.add({english: words[i]});
			}
		}
	}
});

var MyWordList = Backbone.Collection.extend({
	model: Word
});

// App View 
var AppView = Backbone.View.extend({
	el: "#app-view",

	events: {
		"keypress #sentence": "check",
	},

	initialize: function(){
		this.collection = new WordList();
		this.$input = this.$('#sentence');
		this.$ul = this.$('#word-list-ul');
		this.$button = this.$('.save-btn');

		this.collection.on('change:saved', this.appearBtn, this);
	},

	appearBtn: function(){
		var savedWords = _.filter(this.collection.models, function(word){return word.get('saved') === true});
		console.log(savedWords.length);
		if(savedWords.length > 0){
			this.$button.removeClass('disappear');
			// var btnView = new ButtonView();
			// console.log(btnView.render().el);
			// this.$button.append(btnView.render().el);	
		}else{
			this.$button.addClass('disappear');
			console.log(this.$button);
		}
	},

	check: function(e){
		e.preventDefault();

		if(e.which !== ENTER_KEY || !this.$input.val().trim()){
			return;
		}
		this.$ul.empty();
		this.collection.reset();

		var sentence = this.$input.val().trim();		
		var specialChars = /[~!#$^&*=+|:;?"<,.>'\s\n\r\s+]/;
		sentence = sentence.split(specialChars).join(" ");
		var arr = sentence.toLowerCase().split(" ").sort().unique();

		this.collection.addAll(arr);

		console.log(this.collection);

		console.log(arr);

		this.render();
	},

	render: function(){
		var that = this;
		_.each(this.collection.models, function(word){
			that.renderWord(word);
		});
	},

	renderWord: function(word){
		var wordView = new WordView({model: word});
		this.$ul.append(wordView.render().el);	
	}
});

var appView = new AppView();	

