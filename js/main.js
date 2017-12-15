jQuery(document).ready(function () {
    var width_window = $(window).width();
    
    //---------------------------//
    // mask for input +7 (___) ___-__-__
    $('input[name=phone]').mask('+7 ( 999 ) 999-99-99');
    $('input[name=phone]').change(function(){
        if($(this).val().length < 17) {
            $(this).css({backgroundColor: '#95120c'});
        } else {
            $(this).css({backgroundColor: '#abff79'});
        }
    });
    //--------------------------------
    $('body').append('<a href="javascript:" class="wsj-btn-popup" id="wsj-btn-call-thank" data-id="popup-call-thank" style="opacity:0; position:absolute; right: 100%"></a>');
    $('form').submit(function(event){
        var result = true;
        $(this).find('input[name="phone"]').each (function (){
            if($(this).val().length <= 0) {
                result = false;   
            } 
        });
        if (!result) {
            $(this).find('input[name="phone"]').css({border:'1px solid #d12727'});
            return false;
        }
        //$(this).find('input[name="name"]').val('');
        $(this).find('input[name="phone"]').css({backgroundColor: '#fff'});
        //$(this).find('textarea').val('');
        var data = $(this).serialize();
        $.ajax({
          type: 'POST',
          data: data,
          success: function(data) {
            $('body').find('input[type="text"]').val('');
            //$('body').find('.wsj-popup').css({display: 'none'});
            $('.wsj-popup-active')[0].wsClose();
            $('#popup-thank')[0].wsOpen();
          },
          error:  function(xhr, str){
            alert('Возникла ошибка: ' + xhr.responseCode);
          } 
        });
        return false;
    });
    //----------------------------//
    $(function(){
        var star1 = $('.wsj-bestfur__star-1').fadeIn();
        var star2 = $('.wsj-bestfur__star-2').fadeIn();
        var star3 = $('.wsj-bestfur__star-3').fadeIn();
        var star4 = $('.wsj-bestfur__star-4').fadeIn();
        
        setInterval(function(){
            toggleStar(star1);
        }, 2300);
        setTimeout(function(){
            setInterval(function(){
                toggleStar(star2);
            }, 3400);   
        }, 643);
        setTimeout(function(){
            setInterval(function(){
                toggleStar(star3);
            }, 2800);   
        }, 2643);
        setTimeout(function(){
            setInterval(function(){
                toggleStar(star4);
            }, 4000);   
        }, 2643);
        
        function toggleStar(Star) {
            if (!Star.hasClass('ws-visible')) {
                Star.addClass('ws-visible');
                Star.fadeOut(RandomInt(700, 1500));
            } else if (Star.hasClass('ws-visible')) {
                Star.removeClass('ws-visible');
                Star.fadeIn(RandomInt(700, 1500));
            } 
        }
        
        function RandomInt(min, max)
        {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    });
    //----------------------------//
    $('.wsw-popup').wsPopup({
        WrapperClass: '.wsw-popup',
        PopupClass: '.wsb-popup',
        PopupCloseBtnClass: '.wsb-popup__close'
    });
    //----------------------------//
    /*$('.wsj-anchor-nav').wsAnchor({
        ScrollToScreen: false    
    });*/
    //----------------------------//
    $("a").click(function (event) {
        if ($(this).hasClass("wsj-anchor-nav")) {
            event.preventDefault();
            var id  = $(this).attr('href'),
            top = $(id).offset().top;
            $('body,html').animate({scrollTop: top}, 1500);
        }
	});
    //----------------------------//
    // Hide preloader
    function hidePreloader() {
        wrap.fadeOut(2000);
        preloader.delay(1700).fadeOut(2000);
    }
    
    if ($('#wsj-preloader').length > 0) {
        var preloader = $('#wsj-preloader');
        var logo = preloader.find('img');
        var progress = preloader.find('#wsj-preloader__progress');
        var wrap = preloader.find('.wsj-preloader__wrapper');
        progress.addClass('active');
        setTimeout(hidePreloader, 3000);
    }
    //----------------------------//
    /*Меню (wsb-menu)*/
    $(function(){
        var MenuButton = '.wsj-menu-button';
        var MenuParent = '.wsj-menu-parent';
        var MenuContainer = '.wsj-menu-container';
        if  ($(MenuContainer).length > 0) {
            $(MenuButton).on('click', function(){
                var container = $(this).parent(MenuParent).find(MenuContainer);
                
                $(this).toggleClass('ws-active');
                if (container.hasClass('ws-active'))
                    container.toggleClass('ws-active').slideUp('normal');
                else
                    container.toggleClass('ws-active').slideDown('normal');
            })    
        }  
    });
    //----------------------------//
    if ($('.wsj-sketch__slider'))
        $(function(){
            $.ajax({
                url: 'templates/sketch-loader.php',
                dataType: 'html',
                success: function(data){
                    $('.wsj-sketch__slider').append(data);
                    $('.wsj-sketch__slider').slick({
                        infinite: true,
                        slidesToShow: 5,
                        slidesToScroll: 5,
                        arrows: true,
                        dots: true,
                        responsive: [
                            {
                                breakpoint: 1159,
                                settings: {
                                    slidesToShow: 3,
                                    slidesToScroll: 3,
                                }
                            },
                            {
                                breakpoint: 711,
                                settings: {
                                    slidesToShow: 2,
                                    slidesToScroll: 2,
                                }
                            },
                            {
                                breakpoint: 600,
                                settings: {
                                    slidesToShow: 2,
                                    slidesToScroll: 2,
                                    dots: false
                                }
                            },
                            {
                                breakpoint: 530,
                                settings: {
                                    slidesToShow: 1,
                                    slidesToScroll: 1,
                                    dots: false
                                }
                            },
                        ]
                    });
                    $('.wsj-sketch-gallery').swipebox();
                }
            });
        });
    //----------------------------//
    //First window
    if (width_window > 767) {
        $('.ws-footer').after('<script src="js/webflow.js"></script>');

        $(".wsj-italian__layer").parallax(
            { mouseport: $(".wsj-italian__mouseport")},
            { xparallax: '60px',    yparallax: '40px' },      // Layer 1
            { xparallax: '30px',    yparallax: '20px' },       // Layer 2
            { xparallax: '40px',    yparallax: '10px' },      // Layer 1
            { xparallax: '60px',    yparallax: '20px' }       // Layer 2
        );
        $(".ws-header__parallax-layer").parallax(
            { mouseport: $(".wsj-general__mouseport")},
            { xparallax: '120px',    yparallax: '0px' },      // Layer 1
            { xparallax: '60px',    yparallax: '0px' },       // Layer 2
            { xparallax: '80px',    yparallax: '0px' }       // Layer 2
        );
    }
    //----------------------------//
});