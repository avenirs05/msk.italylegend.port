; $ = jQuery;

// --------------------------------------
// Якоря - wsAnchor
//
// Проверено в браузерах
// IE 9+, Safari 9+, Google Chrome 30+,  Firefox 24+, Opera 12.18+, iPad 2 / 4.3.3  Mobile Safari 5.02,  Android Galaxy S5 / 4.4  Android Browser 4.4
// 
// АТТРИБУТЫ
//      AnimationTime      - Время за которое проходит скролл
//      TimeStep           - Шаг анимации (Регулирует плавность)
//      Mobile:            - Порог на котором отключаются такие возможности как AdaptiveScreen и ContentToCenter (Пример: 768)
//      Stop               - Указывает разрешена ли пользовательская остановка скролла. (true | false)
//      ScrollToScreen     - Если true, включает поэкранную прокрутку (true | false)
//      AdaptiveScreen     - Если true, растягивает скрины, на высоту равную высоте экрана пользователя (true | false)
//      ContentToCenter    - Если true, выставит контент по центру (true | false)
//      WrapperCss         - Селектор скрина
//      ContentCss         - Селектор контента в скрине (Если включен ContentToCenter)
//      ActiveLinkClass    - Класс активной ссылки
//      ActiveWrapperClass - Класс активного скрина
//
// ЭКШЕНЫ
//      setActiveAnchor()  - Устанавливает ссылку на активный скрин в адресную строку (Контекста нету)
//      scrollToScreen()   - Начинает прокрутку до указанного в ативной ссылке скрина. (Контекст активной ссылки)
//      scrollStop()       - Останавливает прокрутку (Контекста нету)
//      scrollNext()       - Прокручивает до следующего скрина (Контекста нету)
//      scrollPrev()       - Прокручивает до предыдущего скрина (Контекста нету)
//
// СОБЫТИЯ
//      wsOnUserStop()        - срабатывает после пользовательской остановки
//      wsOnStartScroll()     - срабатывает после начала прокрутки
//      wsOnFinishScroll()    - срабатывает после окончания прокрутки   
//      wsOnTopScroll()       - срабатывает после начала поэкранной прокрутки вверх
//      wsOnBottomScroll()    - срабатывает после начала поэкранной прокрутки вниз
//      wsOnScreenChange()    - срабатывает после смены активного экрана
//      wsOnTimer()           - срабатывает во время итерации таймера
//
// ...................................
$.fn.wsAnchor = function(Attrs){
    //Attrs
    var defaultAttrs = {
        AnimationTime:          500, 
        TimeStep:               10,
        Mobile:                 768,
        Stop:                   true,
        ScrollToScreen:         true,
        AdaptiveScreen:         false,
        ContentToCenter:        false, 
        WrapperCss:             '.wsj-anchor-target',
        ContentCss:             '.wsj-anchor-target__content',
        ActiveLinkClass:        'wsj-anchor-link-active',
        ActiveWrapperClass:     'wsj-anchor-wrapper-active'
    };
    
    $.extend (defaultAttrs, Attrs);
    Attrs = defaultAttrs;
    
    // -----------------------------------------------
    // INIT
    function init(){
        setVars();
        setEvents();
        start();
    }
    // ...................................
    function setVars() {
        qScreens        = $(Attrs.WrapperCss);
        Timer           = false;          
        Time            = 0;
        Length          = 0;
        PrevScroll      = $('body').scrollTop();
        DeviceHeight    = $(window).height();
        
        if (Attrs.ScrollToScreen) {
            Attrs.Stop  = false;
        }
        if ($(window).width() <= Attrs.Mobile) {
            Attrs.AdaptiveScreen = false;
            Attrs.ContentToCenter = false;
        }
    }
    // ...................................
    function setEvents() {
        qSelf.click(onClick);
        $(window).scroll(onScroll);
        
        registerWheel($('body')[0], onWheel);
        qSelf.on('wsOnUserStop', onUserStop);
        qSelf.on('wsOnStartScroll', onStartScroll);
        qSelf.on('wsOnFinishScroll', onFinishScroll);
        qScreens.on('wsOnTopScroll', onTopScroll);
        qScreens.on('wsOnBottomScroll', onBottomScroll);
        qScreens.on('wsOnScreenChange', onScreenChange);
        qScreens.on('wsOnTimer', onTimer);
    }
    // -----------------------------------------------
    // FUNCTIONS
    // ...................................
    function getWheelDirection(Event) {
        Event = Event || window.event;
        var delta = Event.deltaY || Event.detail || Event.wheelDelta;
        
        if (delta < 0) {
            return 'up';
        }
        
        return 'down';
    }
    // ...................................
    function registerWheel(Element, Handler) {
        if (Element.addEventListener) {
          if ('onwheel' in document) {
            // IE9+, FF17+, Ch31+
            Element.addEventListener("wheel", Handler);
          } else if ('onmousewheel' in document) {
            // устаревший вариант события
            Element.addEventListener("mousewheel", Handler);
          } else {
            // Firefox < 17
            Element.addEventListener("MozMousePixelScroll", Handler);
          }
        } else { // IE8-
          Element.attachEvent("onmousewheel", Handler);
        }
    }
    // ...................................
    function getScreenFromLink() {
        return $($(this).attr('href'));
    }
    // ...................................
    function getNextScreen(CurrentScreen, Screens) {
        var id = CurrentScreen.attr('id');
        var next_screen = false;
        var flag_next   = false;
        var index = Screens.index(CurrentScreen);
        
        if (index < Screens.length-1) {
            index++;
        }
        
        next_screen = $(Screens[index]);
        
        return next_screen;
    }
    // ...................................
    function getPrevScreen(CurrentScreen, Screens) {
        var id = CurrentScreen.attr('id');
        var prev_screen = null;
        var index = Screens.index(CurrentScreen);
        
        if (index != 0) {
            index--;
        }
        
        prev_screen = $(Screens[index]);
        
        return prev_screen;
    }
    // ...................................
    function getScreenFromScroll(DeviceHeight) {
        var device_center = DeviceHeight / 2;
        var current_position = $(window).scrollTop();
        var current_center_position = current_position + device_center;
        var best_screen = false;
        var best_screen_position = false;

        $(this).each(function(){
            self = $(this);
            
            var element_center_position = getScrollFromScreen.call(this) + self.height() / 2;
            var difference = Math.abs(current_center_position - element_center_position);
            
            if (!best_screen || difference <= best_screen_position) {
                best_screen = self;
                best_screen_position = difference;
            }
        });
        
        return best_screen;
    }
    // ...................................
    function getScrollFromScreen () {
        return $(this).offset().top;
    }
    // ...................................
    function getScrollPosition(MaxTime, CurrentTime, Length) {
        return Math.sin((Math.PI/2)/MaxTime*CurrentTime)*Length;
    }
    // ...................................
    function setAdaptiveScreen () {
        $(this).css('height', $(window).height());    
    }
    // ...................................
    function setContentToCenter () {
        $(this).each(function(){
            var height = $(this).height
            
            $(this).css({
                position:   'absolute',
                top:        '50%',
                marinTop:   height/2*-1,
            });
        });
    }
    // -----------------------------------------------
    // ACTIONS
    // ...................................
    function setActiveAnchor() {
        document.location.hash = '#'+Self.wsActive.attr('id');
    }
    // ...................................
    function wheel(Event) {
        
        if (Timer && Attrs.Stop) {
            scrollStop();
            qSelf.trigger('wsOnUserStop');
        }
        
        if (Attrs.ScrollToScreen) {
            Event.preventDefault();
            var direction = getWheelDirection(Event);
            
            if (direction == 'up') 
                scrollPrev();
            else
                scrollNext();
        }
    }
    // ...................................
    function scroll() {
        Self.wsActive = getScreenFromScroll.call(qScreens, DeviceHeight);
    }
    // ...................................
    function scrollToScreen() {
        var screen = getScreenFromLink.call(this);
        $(this).trigger({
            type:'wsOnStartScroll',
            screen: screen
        });
    }
    // ...................................
    function scrollStop() {
        clearInterval(Timer);
        Timer = false;
        
        Self.wsActive = getScreenFromScroll.call(qScreens, DeviceHeight);
    }
    // ...................................
    function scrollNext() {
        var next = getNextScreen(getScreenFromScroll.call(qScreens, DeviceHeight), qScreens);
        
        if (next) {
            startScroll.call(next);
            qSelf.trigger('wsOnBottomScroll');
        }
    }
    // ...................................
    function scrollPrev() {
        var prev = getPrevScreen(getScreenFromScroll.call(qScreens, DeviceHeight), qScreens);
        
        if (prev) {
            startScroll.call(prev);
            Self.wsActive.trigger('wsOnTopScroll');
        }
    }
    // ...................................
    function startScroll() {
        var scroll_from_screen = getScrollFromScreen.call(this);
        var difference_last_screen = $(document).height() - DeviceHeight;
        
        StartPosition = $(window).scrollTop();
        Time = 0;            
        
        Length = scroll_from_screen - StartPosition;
        
        if (scroll_from_screen >  difference_last_screen)
            Length = difference_last_screen - StartPosition;
            
        scrollStop();
        
        Timer = setInterval(function(){
            Self.wsActive.trigger('wsOnTimer');
        }, Attrs.TimeStep);
    }
    // ...................................
    function nextAnimationStep() {
        Time += Attrs.TimeStep;
        
        var abs_length = Math.abs(Length);
        var top = StartPosition + getScrollPosition(Attrs.AnimationTime, Time, Length);
 
        var difference = Math.abs(top - StartPosition);
        
        if (difference >= abs_length) {
            top = Length + StartPosition;
            scrollStop();
            qSelf.trigger('wsOnFinishScroll');
        }
        
        $(window).scrollTop(top);    
    }
    // ...................................
    function start() {
        if (Attrs.AdaptiveScreen) {
            setAdaptiveScreen.call(qScreens, DeviceHeight);
        }
        if (Attrs.ContentToCenter) {
            setContentToCenter.call(qScreens.find(Attrs.ContentCss));
        }
        Self.wsActive = getScreenFromScroll.call(qScreens, DeviceHeight);
    }
    // -----------------------------------------------
    // EVENTS
    // ...................................
    function onWheel(e) {
        wheel(e);
    }
    // ...................................
    function onClick(e) {
        scrollToScreen.call(this);
        return false;
    }
    // ...................................
    function onUserStop() {}
    // ...................................
    function onStartScroll(Screen) {

        startScroll.call(Screen.screen);
    }
    // ...................................
    function onScroll() {
        scroll();
    }
    // ...................................
    function onFinishScroll() {
        setActiveAnchor();
    }
    // ...................................
    function onTopScroll() {

    }
    // ...................................
    function onBottomScroll() {}
    // ...................................
    function onScreenChange() {

    }
    // ...................................
    function onTimer() {
        nextAnimationStep();
    }
    // ...................................
    // -----------------------------------------------
    // PROPERTIES
    function __getActive() { 
        return $('.' + Attrs.ActiveWrapperClass);
    }
    function __setActive(Screen) {
        
        if (Self.wsActive.attr('id') != Screen.attr('id')) {
            Screen.trigger('wsOnScreenChange');
        }
        
        links = $('body').find('a[href="#'+Screen.attr('id')+'"]');
        
        $('.' + Attrs.ActiveLinkClass).removeClass(Attrs.ActiveLinkClass);
        $('.' + Attrs.ActiveWrapperClass).removeClass(Attrs.ActiveWrapperClass);
        
        links.addClass(Attrs.ActiveLinkClass);
        Screen.addClass(Attrs.ActiveWrapperClass);
        
    }
    // -----------------------------------------------
    // VARS
    var Self = this;
    var qSelf = $(Self);
    var qScreens;
    var Timer;
    var Time;
    var Length;
    var PrevScroll;
    var StartPosition;
    var DeviceHeight;
    var PageHeight;
    // -----------------------------------------------
    // INTERFACE
    // ...................................
    // fields
    // ...................................
    // methods
    // ...................................
    // properties
    
    Object.defineProperty(Self, 'wsActive', {get: __getActive, set: __setActive});
    // -----------------------------------------------
    // START
    init();
}
// --------------------------------------
// Popup - wsPopup
//
// Проверено в браузерах
// 
//
// АТТРИБУТЫ
//      AnimationTime       - скорость анимации
//      AnimationType       - тип jquery анимации (slide | show | fade)
//      WrapperClass        - главный селектор враппера попапа
//      PopupClass          - селектор контентной части попапа
//      PopupOpenBtnClass   - селектор кнопки, открывающей попап
//      PopupCloseBtnClass  - селектор кнопки, закрывающей попап
//      PopupActive         - класс активного попапа
//
// ЭКШЕНЫ
//      close()             - закрывает попап. Контекста нет
//      open()              - открывает попап. Контекста нет
//      checkKey(Key)       - если esc - генерит событие wsOnEsc. Контекста нет. Key - код клавиши
//
// СОБЫТИЯ
//      wsOnOpen            - срабатывает после того как попап открылся
//      wsOnClose           - срабатывает после того как попап закрылся
// ...................................

$.fn.wsPopup = function(Attrs){
    //Attrs
    var defaultAttrs = {
        AnimationTime:          500,
        AnimationType:          'fade',
        WrapperClass:           '.wsj-popup-wrapper',
        PopupClass:             '.wsj-popup',
        PopupOpenBtnClass:      '.wsj-popup-open',
        PopupCloseBtnClass:     '.wsj-popup-close',
        PopupActive:            'wsj-popup-active'
    };
    
    $.extend (defaultAttrs, Attrs);
    Attrs = defaultAttrs;
    
    this.each(function(){
        // -----------------------------------------------
        // INIT
        function init(){
            setVars();
            setEvents();
        }
        // ...................................
        function setVars() {
            qSelf           = $(Self);
            qWrapper        = qSelf;
            qPopupOpenBtn   = $('body').find(Attrs.PopupOpenBtnClass + '[data-id="'+qWrapper.attr('id')+'"]');
            qPopup          = qSelf.find(Attrs.PopupClass);
            qPopupCloseBtn  = qSelf.find(Attrs.PopupCloseBtnClass);
        }
        // ...................................
        function setEvents() {
            qPopupOpenBtn.click(onOpenBtnClick);
            qPopupCloseBtn.click(onCloseBtnClick);
            qWrapper.click(onCloseAreaClick);
            qPopup.click(onPopupClick);
            $(document).keyup(onKeyPress);
            
            qSelf.on('wsOnClose', onOpen);
            qSelf.on('wsOnOpen', onClose);
            qSelf.on('wsOnEsc', onEsc);
        }
        // -----------------------------------------------
        // FUNCTIONS
        function openShow(Speed, Callback) {
            $(this).show(Speed, Callback);
        }
        // ...................................
        function closeShow(Speed, Callback) {
            $(this).hide(Speed, Callback);
        }
        // ...................................
        function openSlide(Speed, Callback) {
            $(this).slideDown(Speed, Callback);
        }
        // ...................................
        function closeSlide(Speed, Callback) {
            $(this).slideUp(Speed, Callback);
        }
        // ...................................
        function openFade(Speed, Callback) {
            $(this).fadeIn(Speed, Callback);
        }
        // ...................................
        function closeFade(Speed, Callback) {
            $(this).fadeOut(Speed, Callback);
        }
        // ...................................
        function setOverflow() {
            $('body').css({
                overflowX: 'hidden',
                overflowY: 'hidden',
                width: $('body').width()
            });
        }
        // ...................................
        function clearOverflow() {
            $('body').css({
                overflowX: 'hidden',
                overflowY: 'auto',
                width:     'auto'
            });
        }
        // ...................................
        function setCenterPosition() {
            var copy = this.clone();
            var width;
            var height;
            
            $('body').append(copy);
            copy.css({
                position: 'absolute'
            });
            
            width = copy.width();
            height = copy.height();
            copy.remove();
            
            this.css({
                position:   'absolute',
                top:        '50%',
                left:       '50%',
                marginTop:  -1*(height/2),
                marginLeft: -1*(width/2)
            });
        }
        // -----------------------------------------------
        // ACTIONS
        function close(){
            clearOverflow();
            Self.wsAnimationClose.call(qWrapper, Attrs.AnimationTime, function(){qSelf.trigger('wsOnClose')});
            qWrapper.removeClass(Attrs.PopupActive);
        }
        // ...................................
        function open() {
            setOverflow();
            Self.wsAnimationOpen.call(qWrapper, Attrs.AnimationTime, function(){qSelf.trigger('wsOnOpen')});
            setCenterPosition.call(qPopup);
            qWrapper.addClass(Attrs.PopupActive);
        }
        // ...................................
        function checkKey(Key) {
            if (!qSelf.hasClass(Attrs.PopupActive)) {
                return;
            }
            if (Key == 27) {
                qSelf.trigger('wsOnEsc');
            }
        }
        // -----------------------------------------------
        // EVENTS
        function onOpen  () {}
        // ...................................
        function onClose () {}
        // ...................................
        function onCloseBtnClick (e) {
            e.preventDefault();
            close();
        }
        // ...................................
        function onOpenBtnClick(e) {
            e.preventDefault();
            open();
        }
        // ...................................
        function onCloseAreaClick () {
            close();
        }
        // ...................................
        function onEsc () {
            close();
        }
        // ...................................
        function onKeyPress (Key) {
            checkKey(Key.keyCode);
        }
        // ...................................
        function onPopupClick (e) {
            e.stopPropagation();
        }
        // -----------------------------------------------
        // PROPERTIES
        function __getAnimationClose() {
            switch (Attrs.AnimationType) {
                case 'slide': return closeSlide;
                case 'fade' : return closeFade;
                case 'show' : return closeShow;    
            }
            
            return closeFade;
        }
        function __getAnimationOpen() {
            switch (Attrs.AnimationType) {
                case 'slide': return openSlide;
                case 'fade' : return openFade;
                case 'show' : return openShow;    
            }
            
            return openFade;
        }
        // -----------------------------------------------
        // VARS
        var Self = this;
        
        var qSelf;
        var qWrapper;
        var qPopupOpenBtn;
        var qPopup;
        var qPopupCloseBtn;
        // -----------------------------------------------
        // INTERFACE
        // ...................................
        // fields
        // ...................................
        // methods
        Self.wsClose    = close;
        Self.wsOpen     = open;
        Self.wsCheckKey = checkKey;
        // ...................................
        // properties
        Object.defineProperty(Self, 'wsAnimationClose', {get: __getAnimationClose});
        Object.defineProperty(Self, 'wsAnimationOpen', {get: __getAnimationOpen});
        // -----------------------------------------------
        // START
        init();
    });
}

// --------------------------------------
// Адаптивные табы - wsTabs
//
// Проверено в браузерах
// Crome 17+, Opera 12.18+, FF 15+, Safari 5.1.7+ Desctop, IE9+, Android Galaxy S5 / 4.4  Android Browser 4.4
//
// АТТРИБУТЫ
//      AnimationTime       - скорость анимации
//      MobileWidth         - брейкпоинт на котором табы, изменятся на аккордеон
//      TabsClass           - главный селектор враппера табов
//      AccordionClass      - селектор враппера контентной части акордеона
//      TabsButtonClass     - селектор ссылки (кнопки переключающей таб)
//      TabClass            - селектор контентной части таба
//      BtnActive           - класс активной кнопки (ссылки)
//      TabActive           - класс активной контентной части
//      AccordionBtnOpen    - класс-метка кнопки с открытым аккордеоном
//      AccordionTabOpen    - класс-метка открытой контентной части аккордеона
//
// ЭКШЕНЫ
//      changeTab()         - переключает вкладку. Контекст - целевая кнопка
//      changeMode()        - проверяет и устанавливает режим экрана. Контекста нет
//      toMobile()          - переключает в аккордеон. Контекста нет
//      toDesctop()         - переключает в табы. Контекста нет
//      accordionOpen()     - открывает аккордеон. Контекст - целевая кнопка
//      accordionClose()    - закрывает аккордеон. Контекст - целевая кнопка
//      accordionChange()   - открывает или закрывает аккордеон. Контекст - целевая кнопка
//      setWrapperHeight()  - адаптирует высоту враппера контентной части под высоту активной вкладки в десктопной версии. Контекста нет
//    
// СВОЙСТВА
//      IsMobile        - режим от текущего размера экрана. Только чтение
//      ActiveButton    - активная кнопка. Чтение и запись
//
// СОБЫТИЯ
//      wsOnDesctop             - срабатывает после переключения в десктопный режим
//      wsOnMobile              - срабатывает после переключения в мобильный режим
//      wsOnTabChange           - срабатывает после переключения активной вкладки
//      wsOnAccordionOpen       - срабатывает после открытия аккордеона
//      wsOnAccordionClose      - срабатывает после закрытия аккордеона
//      wsOnActiveButtonChange  - срабатывает после смены активной кнопки
// ...................................

$.fn.wsTabs = function(Attrs){
    //Attrs
    var defaultAttrs = {
        AnimationTime:      500,
        MobileWidth:        767,
        TabsClass:          '.wsj-tabs__wrapper',
        AccordionClass:     '.wsj-accordion__wrapper',
        TabsButtonClass:    '.wsj-tab__btn',
        TabClass:           '.wsj-tabs__item',
        BtnActive:          'wsj-tab__btn-active',
        TabActive:          'wsj-tab__active',
        AccordionBtnOpen:   'wsj-accordion__btn-open',
        AccordionTabOpen:   'wsj-accordion__tab-open'
    };
    
    $.extend (defaultAttrs, Attrs);
    Attrs = defaultAttrs;
    
    this.each(function(){
        // -----------------------------------------------
        // INIT
        function init(){
            setVars();
            setEvents();
            start();
        }
        // ...................................
        function setEvents() {
            qTabsButton.click(onTabClick);
            $(window).resize(onResize);
            
            qSelf.on('wsOnDesctop', onDesctop);
            qSelf.on('wsOnMobile', onMobile);
            qSelf.on('wsOnTabChange', onTabChange);
            qSelf.on('wsOnAccordionOpen', onAccordionOpen);
            qSelf.on('wsOnAccordionClose', onAccordionClose);
            qSelf.on('wsOnActiveButtonChange', onActiveButtonChange);
        }
        // ...................................
        function setVars() {
            qSelf       = $(Self);
            qTabs       = qSelf.find(Attrs.TabsClass);
            qAccordions = qSelf.find(Attrs.AccordionClass);
            qTabsButton = qSelf.find(Attrs.TabsButtonClass);
            qTab        = qSelf.find(Attrs.TabClass);
            
            Mode        = false;
        }
        // ...................................
        function start() {
            changeMode();
            
            if (!Mode) changeTab.call(Self.ActiveButton);
        }
        // -----------------------------------------------
        // FUNCTIONS
        function hideTab(Speed){
            $(this).stop().fadeOut(Speed);
        }
        // ...................................
        function showTab(Speed){
            $(this).stop().fadeIn(Speed);
        }
        // ...................................
        function hideAllTab(Speed) {
            hideTab.call(this, Speed);
        }
        // ...................................
        function hideAccordion(Speed) {
            $(this).stop().slideUp(Speed);
        }
        // ...................................
        function openAccordion(Speed) {
            $(this).stop().slideDown(Speed);
        }
        // ...................................
        function hideAllAccordion() {
            hideAccordion.call(this, 0);
        }
        // ...................................
        function showAllAccordion() {
            openAccordion.call(this, 0);
        }
        // ...................................
        function isMobile(width) {
            if ($('body').width() <= Attrs.MobileWidth) return true;
            
            return false;
        }
        // ...................................
        function tabToAccordion(Container) {
            this.each(function(){
                var tab = findTab.call($(this));
                $(this).next(Container).append(tab);
            });
        }
        // ...................................
        function accordionToTab(Container) {
            this.each(function(){
                var tab = findTab.call($(this));
                Container.append(tab);
            });
        }
        // ...................................
        function getTab(Id) {
            return qSelf.find('[data-id="'+Id+'"]');
        }
        // ...................................
        function findTab() {
            var tab_id = $(this).attr('href').replace('#','');
            
            return getTab(tab_id);
        }
        // ...................................
        function getTabHeight() {
            tab = $(this);
            var current_display = tab.css('display');
            var height = false;
            
            if (current_display == 'none') {
                tab.css({display: 'block'});
                height = tab.height();
                tab.attr('style', '');
            } else if (current_display == 'block'){
                height = tab.height();
            }
            
            return height;
        }
        // ...................................
        function setActiveClass(ActiveButtonClass, ActiveTabClass) {
            $(Self.ActiveButton).removeClass(ActiveButtonClass);
            $(this).addClass(ActiveButtonClass);
            
            $(qTabs).find('.'+ActiveTabClass).removeClass(ActiveTabClass);
            getTab($(this).attr('href').replace('#', '')).addClass(ActiveTabClass);
        }
        // ...................................
        function setOpenClass(OpenButtonClass, OpenTabClass) {
            $(this).addClass(OpenButtonClass);
            getTab($(this).attr('href').replace('#', '')).addClass(OpenTabClass);
        }
        // ...................................
        function clearOpenClass(OpenButtonClass, OpenTabClass) {
            $(this).removeClass(OpenButtonClass);
            getTab($(this).attr('href').replace('#', '')).removeClass(OpenTabClass);
        }
        // ...................................
        function appendDot(String) {
            return '.'+String;
        }
        // -----------------------------------------------
        // ACTIONS
        function changeTab () {
            var tab = findTab.call($(this));
            
            setActiveClass.call(this, Attrs.BtnActive, Attrs.TabActive);
            hideAllTab.call(qTab, Attrs.AnimationTime);
            showTab.call(tab, Attrs.AnimationTime);
            
            qSelf.trigger('wsOnTabChange');
        }
        // ...................................
        function changeMode () {
            if (Mode == Self.IsMobile) return;
            
            if (!Self.IsMobile) {
                qSelf.trigger('wsOnDesctop');
            } else {
                qSelf.trigger('wsOnMobile');
            }
        }
        // ...................................
        function toMobile () {
            Mode = Self.IsMobile;
            tabToAccordion.call(qTabsButton, Attr.AccordionClass);
            showAllAccordion.call(qAccordions.find(Attrs.TabClass));
            hideAllAccordion.call(qAccordions.find(Attrs.TabClass));
            accordionOpen.call(Self.ActiveButton);
        }
        // ...................................
        function toDesctop () {
            Mode = Self.IsMobile;
            accordionToTab.call(qTabsButton, qTabs);
            changeTab.call(Self.ActiveButton);
        }
        // ...................................
        function accordionOpen () {
            var tab = findTab.call($(this));
            
            setActiveClass.call(this, Attrs.BtnActive, Attrs.TabActive);
            setOpenClass.call(this, Attrs.AccordionBtnOpen, Attrs.AccordionTabOpen);
            openAccordion.call(tab, Attrs.AnimationTime);
            
            qSelf.trigger('wsOnAccordionOpen');
        }
        // ...................................
        function accordionClose () {
            var tab = findTab.call($(this));
            
            clearOpenClass.call(this, Attrs.AccordionBtnOpen, Attrs.AccordionTabOpen);
            $(this).removeClass(Attrs.BtnActive);
            hideAccordion.call(tab, Attrs.AnimationTime);
            
            qSelf.trigger('wsOnAccordionClose');
        }
        // ...................................
        function accordionChange () {      
            if ($(this).hasClass(Attrs.BtnActive) || $(this).hasClass(Attrs.AccordionBtnOpen)) {
                accordionClose.call(this);
                return;
            }
            
            if (!$(this).hasClass(Attrs.BtnActive) && !$(this).hasClass(Attrs.AccordionBtnOpen)) {
                accordionOpen.call(this);
                return;
            }
        }
        // ...................................
        function setWrapperHeight() {
            var height = findTab.call(Self.ActiveButton).height();
            qTabs.height(height);
        }
        // -----------------------------------------------
        // EVENTS
        function onTabClick() {
            if ($(this).hasClass(Attrs.BtnActive) && !Mode) return false;
            
            Self.ActiveButton = $(this);
            
            return false;
        }
        // ...................................
        function onResize() {
            changeMode();
        }
        // ...................................
        function onMobile() {
            toMobile();
        }
        // ...................................
        function onDesctop() {
            toDesctop();
        }
        // ...................................
        function onAccordionOpen() {}
        // ...................................
        function onAccordionClose() {}
        // ...................................
        function onTabChange() {
            setWrapperHeight();
        }
        // ...................................
        function onActiveButtonChange() {}
        // -----------------------------------------------
        // PROPERTIES
        function __getIsMobile(){
            return isMobile();
        }
        // ...................................
        function __getActiveButton() {
            var active_button = qSelf.find(appendDot(Attrs.BtnActive));
            
            if (active_button.length == 0) return qTabsButton.first();
            
            return active_button;
        }
        // ...................................
        function __setActiveButton(Button) {
            if (!Mode)
                changeTab.call(Button);
            else
                accordionChange.call(Button);
            
            qSelf.trigger('wsOnActiveButtonChange');
        } 
        // -----------------------------------------------
        // VARS
        var Self = this;
        var Mode;
        
        var qSelf;
        var qTabs;
        var qTab;
        var qAccordions;
        var qTabsButton;
        // -----------------------------------------------
        // INTERFACE
        // fields
        // ...................................
        // methods
        Self.wsChangeTab          = changeTab;
        Self.wsChangeMode         = changeMode;
        Self.wsToMobile           = toMobile;
        Self.wsToDesctop          = toDesctop;
        Self.wsAccordionOpen      = accordionOpen;
        Self.wsAccordionClose     = accordionClose;
        Self.wsAccordionChange    = accordionChange;
        Self.wsSetWrapperHeight   = setWrapperHeight;
        // ...................................
        // properties
        Object.defineProperty(Self, 'IsMobile', {get: __getIsMobile});
        Object.defineProperty(Self, 'ActiveButton', {get: __getActiveButton, set: __setActiveButton});
        // -----------------------------------------------
        // START
        init();
    })
}