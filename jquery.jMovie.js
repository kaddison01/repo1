/**
 * jquery.jMovie.js (15kb)
 * 
 * @author Kevin Addison
 * @version 1.0 (04/19/09)
 * @requires jquery v1.3 or later
 *
 *
 *
 * Browsers:
 * 
 * Firefox: v3.x.x or higher (PC and Mac)
 * Opera: v9.6 or higher
 * Chrome: v1.0.154.53 or higher
 * Safari: v3.2.1 or higher
 * IE: v7, v8
 * 
 *
 *
 * Change Log:
 * 04/22/09 - Added tooltips for the control buttons
 *
 *
 *  To Do:
 *  - add tool tips for control buttons
 *
 *
 * 
 * Usage:
 * 
 * <style type="text/css">@import url('./assets/css/jMovie.style.css');</style>
 * <script type="text/javascript" src="/path/to/jquery/">
 * <script type="text/javascript" src="./assets/js/jquery.jMovie.js"></script>
 * <script type="text/javascript">
 * $(function() {
 * 	$('div#player').jMovie({
 * 		skin:'black, silver or create you own skin. defaults to silver',
 * 		label:'choose a color for label text. defaults to #1A1A1A',
 * 		status: 'choose a color for status text. defaults to #F2F2F2',
 * 		width: choose a width. defaults to 512,
 * 		height: choose a height. defaults to 512,
 * 		urls: [REQUIRED one dimensional array for image urls. separate by comma.]
 * 	});
 * });
 * </script>
 *
 * <body>
 * <div id="player">
 * 	<p id="noscript">ERROR! Javascript needs to be enabled for this player to work.</p>
 * 	<div id="screen">
 * 		<div id="load"></div>
 * 		<div id="animation"></div>
 * 	</div>
 * 	<div id="controlpanel">
 * 		<div id="controlbuttons">
 * 			<!--
 * 			Note: Controls are optional.
 * 			You can delete buttons or divider, add dividers
 * 			Don't add redundant buttons				
 * 			-->
 * 			<div id="playpause" title="play / pause"></div>
 * 			<div class="divider"></div>
 * 			<div id="step" title="step" ></div>
 * 			<div id="swing" title="swing"></div>
 * 			<div class="divider"></div>
 * 			<div id="fast" title="fast"></div>
 * 			<div id="slow" title="slow"></div>
 * 			<div class="divider"></div>
 * 			<div id="direction"></div>
 * 		</div>
 * 		<div id="controllabels">
 * 			<!-- Note: Labels are optional. You can delete labels -->
 * 			<div class="label"><span id="speedlabel"></span> <span id="speedstatus"></span></div>
 * 			<div class="label"><span id="swinglabel"></span> <span id="swingstatus"></span></div>
 * 			<div class="label"><span id="playlabel"></span> <span id="playstatus"></span></div>
 * 		</div>
 * 	</div>
 * </div>
 * </body>
 * 
 */
(function($) {
    $.fn.jMovie = function(options) {
        
	/**
	 * default settings for plugin
	 */
	var defaults = {
	    /**
	     * skin is the style for the control panel and buttons
	     * there are 2 skin modes: black and silver
	     */
	    skin: 'silver',
	    
	    /**
	     * default color settings for label text
	     */
	    label: '#1A1A1A',
	    
	    /**
	     * default color settings for status text
	     */
	    status: '#F2F2F2',
	    
	    /**
	     * default setting for player width
	     */
	    width: 1024,
	    
	    /**
	     * default setting for player height
	     */
            height: 1024,
	    
	    /**
	     * array to hold urls for images
	     */
            urls: []
        },
        settings = $.extend({}, defaults, options);
        
	/**
	 * for each instance of the plugin, do the following...
	 */
        this.each(function() {
	    var $this = $(this);
	    var inc = 1.50;
            var delay = 250;
	    var num_loaded_images = 0;
	    var frame = -1;
            var speed = 16;
            var timeout_id = null;
            var dir = 1;
            var playing = 0;
            var swingon = 0;
	    var index = 0;
	    var images = [];
	    var imageSum = settings.urls.length;
	    var tip; // this holds the text for the tool tip
	    
	    /**
	     * This will remove the javascript error text
	     */
            $('p#noscript').remove();
	    
	    /**
	     * sets initial text for the speed label
	     */
	    $('.label #speedlabel').text('speed:');
	    
	    /**
	     * sets initial text for the swing label
	     */
	    $('.label #swinglabel').text('swing:');
	    
	    /**
	     * sets initial text for the swing status
	     */
	    $('.label #swingstatus').text('off');
	    
	    /**
	     * sets the width property for the player div
	     * defaults to 512px
	     */
	    $('div#player').css('width',settings.width+'px');
	    
	    /**
	     * sets the width and height properties for the screen div
	     * defaults to 512 x 512 px
	     */
            $('div#screen').css({
		'width' : settings.width+'px',
		'height' : settings.height+'px'
	    });
	    
	    /**
	     * sets the width and height properties for the load div
	     * defaults to 512 x 512 px
	     */
	    $('div#load').css({
		'width' : settings.width+'px',
		'height' : settings.height+'px'
	    });
	    
	    /**
	     * sets the width and height properties for the animation div
	     * defaults to 512 x 512 px
	     */
	    $('div#animation').css({
		'width' : settings.width+'px',
		'height' : settings.height+'px'
	    });
	    
	    /**
	     * control panel settings
	     */
            $('div#controlpanel').css({
		'width' : settings.width+'px',
		'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_controlpanel.png)',
		'background-position' : 'top left',
		'background-repeat' : 'repeat-x'
	    });
	    
	    /**
	     * play and pause button settings
	     */
	    $('div#playpause').css({
		'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_pause.png)',
		'background-position' : 'top left',
		'background-repeat' : 'no-repeat',
		'margin-left' : '0'
	    }).hover(function(e) {
		if(playing == 0) {
		    tip = 'play';
		    this.title = "";
		    tooltip(e,$(this),tip);
		    $(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_play_hover.png)'});
		} else {
		    tip = 'pause';
		    this.title = "";
		    tooltip(e,$(this),tip);
		    $(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_pause_hover.png)'});
		}
	    }, function() {
		this.title = tip;
		$('#tooltip').remove();
		if(playing == 1) {
		    $(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_pause.png)'});
		} else {
		    $(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_play.png)'});
		}
	    }).click(function() {
		if(playing == 0) {
		    $('#animation').animate({opacity: 1},400);
		    //if(timeout_id == null && num_loaded_images == imageSum) {
			    $(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_pause.png)'});
			    animate();
		    //}
		} else {
		    $('#animation').animate({opacity: 0.3},400);
		    if(timeout_id) {
			clearTimeout(timeout_id);
		    }
		    $(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_play.png)'});
		    $('#playlabel').html('paused: ');
		    timeout_id = null;
		    playing = 0;
		}
	    });	    
	    
	    /**
	     * step button settings
	     */
            $('div#step').css({
		'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_step.png)',
		'background-position' : 'top left',
		'background-repeat' : 'no-repeat'
	    }).hover(function(e) {
		tip = this.title;
		this.title = "";
		tooltip(e,$(this),tip);
		$(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_step_hover.png)'})
	    }, function() {
		this.title = tip;
		$('#tooltip').remove();
		$(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_step.png)'})
	    }).click(function() {
		if(playing == 0) {
		    $('#animation').animate({opacity: 1},200);
		    step();
		} else {
		    $('#playpause').css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_play.png)'});
		    step();		    
		}
	    });
	    
	    /**
	     * fast button settings
	     */
            $('div#fast').css({
		'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_fast.png)',
		'background-position' : 'top left',
		'background-repeat' : 'no-repeat'
	    }).hover(function(e) {
		tip = this.title;
		this.title = "";
		tooltip(e,$(this),tip);
		$(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_fast_hover.png)'})
	    }, function() {
		this.title = tip;
		$('#tooltip').remove();
		$(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_fast.png)'})
	    }).click(function() {
		speed *= inc;
		show_speed();
	    });
	    
	    /**
	     * slow button settings
	     */
	    $('div#slow').css({
		'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_slow.png)',
		'background-position' : 'top left',
		'background-repeat' : 'no-repeat'
	    }).hover(function(e) {
		tip = this.title;
		this.title = "";
		tooltip(e,$(this),tip);
		$(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_slow_hover.png)'})
	    }, function() {
		this.title = tip;
		$('#tooltip').remove();
		$(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_slow.png)'})
	    }).click(function() {
		speed /= inc;
		show_speed();
	    });
	    
	    /**
	     * swing button settings
	     */
            $('div#swing').css({
		'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_swing.png)',
		'background-position' : 'top left',
		'background-repeat' : 'no-repeat'
	    }).hover(function(e) {
		tip = this.title;
		this.title = "";
		tooltip(e,$(this),tip);
		$(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_swing_hover.png)'})
	    }, function() {
		this.title = tip;
		$('#tooltip').remove();
		$(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_swing.png)'})
	    }).click(function() {
		if(swingon == 1) {
		    swingon = 0;
		    $('#swingstatus').html('off');
		} else {
		    swingon = 1;
		    $('#swingstatus').html('on');
		}
	    });
	    
	    /**
	     * vertical spacer for buttons
	     */
	    $('div.divider').css({
		'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_divider.png)',
		'background-position' : 'top left',
		'background-repeat' : 'no-repeat',
		'width' : '2px',
		'cursor' : 'default'
	    });	    
	    
	    /**
	     * direction button settings
	     */
            $('div#direction').css({
		'width' : '84px',
		'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_reverse.png)',
		'background-position' : 'top left',
		'background-repeat' : 'no-repeat'
	    }).hover(function() {
		if(dir > 0) {
		    $(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_reverse_hover.png)'})
		} else if(dir < 0) {
		    $(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_forward_hover.png)'})
		}
	    }, function() {
		if(dir > 0) {
		    $(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_reverse.png)'})
		} else if(dir < 0) {
		    $(this).css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_forward.png)'})
		}
	    }).click(function() {
		reverse();
	    });	    
	    
	    /**
	     * settings for labels
	     */
	    $('.label span#speedlabel, .label span#swinglabel, .label span#playlabel').css({
		'color' : settings.label
	    });
	    
	    $('.label span#speedstatus, .label span#swingstatus, .label span#playstatus').css({
		'color' : settings.status
	    });
	    
	    
            /**
	     * begin loading images into the browser's cache
	     */
	    for(var i=0;i<imageSum;i++) {
                images[i] = new Image(settings.width,settings.height);
                images[i].onload = function() {
                    count_images();
                }
                images[i].src = settings.urls[i];
	    }
	    
	    
            /**
	     * count_images()
	     * This method counts images as they are loaded into the browser's cache
	     */
            function count_images() {
                if (++num_loaded_images == imageSum) {
		    show_speed();
		    $('#load').remove();
                    animate();
                } else {
		    $('#load').css({
				backgroundImage: 'url(./assets/images/stars.gif)',
				backgroundPosition: 'top left',
				backgroundRepeat: 'repeat'
		    });
                    $('.label #playlabel').html('Loading: ');
		    $('.label #playstatus').html(num_loaded_images+" of "+imageSum);
                }
            }
	    
	    function count_images2() {
		if (++num_loaded_images != imageSum) {
		    $('#load').css({
				backgroundImage: 'url(./assets/images/stars.gif)',
				backgroundPosition: 'top left',
				backgroundRepeat: 'repeat'
		    });
                    $('.label #playlabel').html('Loading: ');
		    $('.label #playstatus').html(num_loaded_images+" of "+imageSum);
		    console.log(num_loaded_images+' '+imageSum);
                } else {
		    show_speed();
		    $('#load').remove();
                    animate();
                }
            }
            
            /**
	     * animate()
	     * This method uses the timeout function and delay to load each image
	     */
            function animate() {
                $('div#animation').fadeIn('slow');
		var j;
                frame = (frame + dir + imageSum) % imageSum;
                j = frame+1;
                if(images[frame].complete) {
                    $('div#animation').html('<img id="frame" src="'+images[frame].src+'" />');
		    $('.label #playlabel').html('playing: ');
		    $('.label #playstatus').html(j+' of '+imageSum);
                    
                    if(swingon && (j == imageSum || frame == 0)) {
                        reverse();
                    }
                    
                    timeout_id = setTimeout(function() {
                        animate();
                    }, delay);
                    
                    playing = 1;
                }
            }	    
	    
	    /**
	     * step()
	     * This method will step through each image and load it into the screen
	     */
	    function step() {
		var j;
		if(timeout_id) {
		    clearTimeout(timeout_id);
		    timeout_id = null;
		}
		frame = (frame + dir + imageSum) % imageSum;
		j = frame + 1;
		
		if(images[frame].complete) {
		    $('div#animation').html('<img src="'+images[frame].src+'" />');
		    $('.label #playlabel').html('step: ');
		    $('.label #playstatus').html(j+' of '+imageSum);
		    
		    if(swingon && (j == imageSum || frame == 0)) {
			reverse();
		    }
		    
		    playing = 0;
		}
	    }	    
	    
            /**
	     * reverse()
	     * This method reverses the direction of the loop
	     */
            function reverse() {
                dir = -dir;
		if(dir > 0) {
		    $('#direction').css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_reverse.png)'});
		}
		
		if(dir < 0) {
		    $('#direction').css({'background-image' : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_forward.png)'});
		}
	    }
	    
            /**
	     * show_speed()
	     * Shows current speed in frames per second
	     */
            function show_speed() {
                $('.label #speedstatus').html(Math.round(speed) + ' (frames/sec)');
		delay = 1000.0 / speed;
            }
            
            
            function charlieFoxtrot() {
            	/**
            	 * charlieFoxtrot method
            	 * This method will fuck everything up
            	 */
            	 $('body > div:nth-child(1)').prepend('<pre id="debug_panel">charlie foxtrot!</pre>');
            	 console.log('CF!!!!!');
            	 
            }
	    
	    /**
	     * tooltip()
	     * This method will create a tool tip for control buttons
	     * @param e dom event
	     * @param t this
	     */
	    function tooltip(e,t,title) {
		$('<div id="tooltip" />')
                   .appendTo('body')
                   .text(title)
                   .hide()
                   .css({
                        backgroundImage : 'url(./assets/images/skins/'+settings.skin+'/'+settings.skin+'_controlpanel.png)',
			backgroundPosition : 'top left',
			backgroundRepeat : 'repeat-x',
			color : settings.label,
			border: '1px solid ' + settings.label,
			top: e.pageY - 20,
                        left: e.pageX + 20
                    })
                   .fadeIn(350);
		
		t.mousemove(function(e) {
		    $('#tooltip').css({
			top: e.pageY - 20,
			left: e.pageX + 20
		    });
		});
	    }
	});
    }
    
    // return the jQuery instance to client
    return this;
})(jQuery);
