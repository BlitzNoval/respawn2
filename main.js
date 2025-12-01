window.openPanel = function(panelId) {
    const panel = document.getElementById(`panel-${panelId}`);
    if (panel) {
        panel.classList.add('active');

        const leftArrow = document.getElementById('nav-arrow-left');
        const rightArrow = document.getElementById('nav-arrow-right');
        if (leftArrow) leftArrow.style.display = 'none';
        if (rightArrow) rightArrow.style.display = 'none';

        initializeCardStack(panelId);

        const video = panel.querySelector('video');
        if (video) {
            video.load();
            setTimeout(() => {
                video.play().then(() => {
                    const playBtn = video.parentElement.querySelector('.play-btn');
                    if (playBtn) playBtn.classList.add('playing');
                }).catch(err => {
                    console.log('Autoplay prevented:', err);
                    const playBtn = video.parentElement.querySelector('.play-btn');
                    if (playBtn) {
                        playBtn.classList.remove('playing');
                    }
                });
            }, 100);
        }

        if (window.threeJsApp) {
            window.threeJsApp.pauseRendering();
        }
    }
}

function initializeCardStack(panelId) {
    const stack = document.getElementById(`card-stack-${panelId}`);
    const dots = document.getElementById(`dots-${panelId}`);

    if (!stack || !dots) return;

    const cards = stack.querySelectorAll('.info-card');
    const dotElements = dots.querySelectorAll('.dot');
    let currentIndex = 0;

    stack.addEventListener('wheel', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.deltaY > 0 && currentIndex < cards.length - 1) {
            navigateToCard(currentIndex + 1);
        } else if (e.deltaY < 0 && currentIndex > 0) {
            navigateToCard(currentIndex - 1);
        }
    }, { passive: false });

    dotElements.forEach((dot) => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            navigateToCard(index);
        });
    });

    function navigateToCard(newIndex) {
        if (newIndex === currentIndex) return;

        const currentCard = cards[currentIndex];
        const newCard = cards[newIndex];

        currentCard.classList.remove('active');
        if (newIndex > currentIndex) {
            currentCard.classList.add('sliding-up');
        } else {
            currentCard.classList.add('sliding-down');
        }

        setTimeout(() => {
            currentCard.classList.remove('sliding-up', 'sliding-down');
            newCard.classList.add('active');
        }, 50);

        dotElements[currentIndex].classList.remove('active');
        dotElements[newIndex].classList.add('active');

        currentIndex = newIndex;
    }
}

window.openPanelFromInfo = function() {
    const btn = document.getElementById('view-project-btn');
    const gameId = btn.getAttribute('data-game-id');
    if (gameId) {
        window.openPanel(gameId);
    }
}

window.closePanel = function(panelId) {
    const allPanels = document.querySelectorAll('.bento-panel');
    allPanels.forEach(p => {
        if (p.classList.contains('active')) {
            p.classList.remove('active');

            p.style.display = '';
            p.style.opacity = '';
            p.style.zIndex = '';

            const content = p.querySelector('.panel-content');
            if (content) {
                content.style.opacity = '';
            }

            const video = p.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
                video.load();
            }

            const playBtn = p.querySelector('.play-btn');
            if (playBtn) {
                playBtn.classList.remove('playing');
            }
        }
    });

    const leftArrow = document.getElementById('nav-arrow-left');
    const rightArrow = document.getElementById('nav-arrow-right');
    if (leftArrow) leftArrow.style.display = 'flex';
    if (rightArrow) rightArrow.style.display = 'flex';
    updateArrowVisibility();

    if (window.threeJsApp) {
        window.threeJsApp.resumeRendering();
    }
}

window.togglePlay = function(videoId) {
    const video = document.getElementById(videoId);
    if (!video) return;

    const playBtn = video.parentElement.querySelector('.play-btn');

    if (video.paused || video.ended) {
        video.play().then(() => {
            if (playBtn) playBtn.classList.add('playing');
        }).catch(err => {
            console.log('Play interrupted:', err);
            if (playBtn) playBtn.classList.remove('playing');
        });
    } else {
        video.pause();
        if (playBtn) playBtn.classList.remove('playing');
    }
}

function updateProgress(video, progressBar) {
    const percent = (video.currentTime / video.duration) * 100;
    progressBar.style.width = percent + '%';
}

window.scrubVideo = function(event, videoId) {
    const progressBarContainer = event.currentTarget;
    const video = document.getElementById(videoId);
    const rect = progressBarContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percent = clickX / rect.width;
    const newTime = percent * video.duration;

    video.currentTime = newTime;
}

document.addEventListener('DOMContentLoaded', () => {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        const videoId = video.id;
        const progressBar = document.getElementById('progress-' + videoId.replace('video-', ''));

        if (progressBar) {
            video.addEventListener('timeupdate', () => {
                updateProgress(video, progressBar);
            });
        }

        video.addEventListener('ended', () => {
            const playBtn = video.parentElement.parentElement.querySelector('.play-btn');
            if (playBtn) {
                playBtn.classList.remove('playing');
            }
        });
    });

    const timeline = document.querySelector('.timeline-container');
    if (timeline) {
        timeline.scrollLeft = 0;
    }
});

window.scrollGallery = function(direction) {
    const gallery = document.querySelector('.gallery-container');
    if (gallery) {
        gallery.scrollBy({
            left: direction * 500,
            behavior: 'smooth'
        });
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        scrollGallery(-1);
    } else if (e.key === 'ArrowRight') {
        scrollGallery(1);
    }
});

window.navigateLeft = function() {
    if (window.threeJsApp && window.threeJsApp.navigationController) {
        window.threeJsApp.navigationController.navigate(-1);
        updateArrowVisibility();
    }
}

window.navigateRight = function() {
    if (window.threeJsApp && window.threeJsApp.navigationController) {
        window.threeJsApp.navigationController.navigate(1);
        updateArrowVisibility();
    }
}

function updateArrowVisibility() {
    if (window.threeJsApp && window.threeJsApp.navigationController) {
        const currentIndex = window.threeJsApp.navigationController.currentIndex;
        const maxIndex = window.threeJsApp.navigationController.cards.length - 1;

        const leftArrow = document.getElementById('nav-arrow-left');
        const rightArrow = document.getElementById('nav-arrow-right');

        if (leftArrow) {
            leftArrow.style.opacity = currentIndex === 0 ? '0.3' : '1';
            leftArrow.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
        }

        if (rightArrow) {
            rightArrow.style.opacity = currentIndex === maxIndex ? '0.3' : '1';
            rightArrow.style.pointerEvents = currentIndex === maxIndex ? 'none' : 'auto';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        updateArrowVisibility();
    }, 100);
});

window.openContactPanel = function() {
    const overlay = document.getElementById('contact-panel-overlay');
    if (overlay) {
        overlay.classList.add('active');

        const leftArrow = document.getElementById('nav-arrow-left');
        const rightArrow = document.getElementById('nav-arrow-right');
        const gameInfo = document.querySelector('.game-info-panel');
        const socialButtons = document.querySelector('.social-buttons');
        const infoButtons = document.querySelector('.info-buttons');

        if (leftArrow) leftArrow.style.opacity = '0';
        if (rightArrow) rightArrow.style.opacity = '0';
        if (gameInfo) gameInfo.style.opacity = '0';
        if (socialButtons) socialButtons.style.opacity = '0';
        if (infoButtons) infoButtons.style.opacity = '0';

        if (window.threeJsApp) {
            window.threeJsApp.pauseRendering();
        }
    }
}

window.closeContactPanel = function() {
    const overlay = document.getElementById('contact-panel-overlay');
    if (overlay) {
        overlay.classList.remove('active');

        const leftArrow = document.getElementById('nav-arrow-left');
        const rightArrow = document.getElementById('nav-arrow-right');
        const gameInfo = document.querySelector('.game-info-panel');
        const socialButtons = document.querySelector('.social-buttons');
        const infoButtons = document.querySelector('.info-buttons');

        if (leftArrow) leftArrow.style.opacity = '1';
        if (rightArrow) rightArrow.style.opacity = '1';
        if (gameInfo) gameInfo.style.opacity = '1';
        if (socialButtons) socialButtons.style.opacity = '1';
        if (infoButtons) infoButtons.style.opacity = '1';

        if (window.threeJsApp) {
            window.threeJsApp.resumeRendering();
        }
    }
}

window.openAboutPanel = function() {
    const overlay = document.getElementById('about-panel-overlay');
    if (overlay) {
        overlay.classList.add('active');

        const leftArrow = document.getElementById('nav-arrow-left');
        const rightArrow = document.getElementById('nav-arrow-right');
        const gameInfo = document.querySelector('.game-info-panel');
        const socialButtons = document.querySelector('.social-buttons');
        const infoButtons = document.querySelector('.info-buttons');

        if (leftArrow) leftArrow.style.opacity = '0';
        if (rightArrow) rightArrow.style.opacity = '0';
        if (gameInfo) gameInfo.style.opacity = '0';
        if (socialButtons) socialButtons.style.opacity = '0';
        if (infoButtons) infoButtons.style.opacity = '0';

        if (window.threeJsApp) {
            window.threeJsApp.pauseRendering();
        }
    }
}

window.closeAboutPanel = function() {
    const overlay = document.getElementById('about-panel-overlay');
    if (overlay) {
        overlay.classList.remove('active');

        const leftArrow = document.getElementById('nav-arrow-left');
        const rightArrow = document.getElementById('nav-arrow-right');
        const gameInfo = document.querySelector('.game-info-panel');
        const socialButtons = document.querySelector('.social-buttons');
        const infoButtons = document.querySelector('.info-buttons');

        if (leftArrow) leftArrow.style.opacity = '1';
        if (rightArrow) rightArrow.style.opacity = '1';
        if (gameInfo) gameInfo.style.opacity = '1';
        if (socialButtons) socialButtons.style.opacity = '1';
        if (infoButtons) infoButtons.style.opacity = '1';

        if (window.threeJsApp) {
            window.threeJsApp.resumeRendering();
        }
    }
}

const panelOrder = ['panel-aimtrainer', 'panel-bombbrawl', 'panel-paddle', 'panel-respawn2'];

window.navigatePanelLeft = function() {
    const activePanel = document.querySelector('.bento-panel.active');
    if (!activePanel) return;

    const currentIndex = panelOrder.indexOf(activePanel.id);
    if (currentIndex <= 0) return;

    const nextIndex = currentIndex - 1;
    const nextPanelId = panelOrder[nextIndex];

    switchPanel(activePanel.id, nextPanelId);
}

window.navigatePanelRight = function() {
    const activePanel = document.querySelector('.bento-panel.active');
    if (!activePanel) return;

    const currentIndex = panelOrder.indexOf(activePanel.id);
    if (currentIndex >= panelOrder.length - 1) return;

    const nextIndex = currentIndex + 1;
    const nextPanelId = panelOrder[nextIndex];

    switchPanel(activePanel.id, nextPanelId);
}

function switchPanel(currentPanelId, nextPanelId) {
    const currentPanel = document.getElementById(currentPanelId);
    const nextPanel = document.getElementById(nextPanelId);

    if (!currentPanel || !nextPanel) return;

    nextPanel.style.display = 'flex';
    nextPanel.style.opacity = '0';
    nextPanel.style.zIndex = '1999';

    const gameId = nextPanelId.replace('panel-', '');
    initializeCardStack(gameId);

    nextPanel.offsetHeight;

    nextPanel.style.opacity = '1';

    const currentContent = currentPanel.querySelector('.panel-content');
    if (currentContent) {
        currentContent.style.opacity = '0';
    }

    const currentVideo = currentPanel.querySelector('video');
    if (currentVideo) {
        currentVideo.pause();
        currentVideo.currentTime = 0;
        currentVideo.load();
    }

    const currentPlayBtn = currentPanel.querySelector('.play-btn');
    if (currentPlayBtn) {
        currentPlayBtn.classList.remove('playing');
    }

    setTimeout(() => {
        currentPanel.classList.remove('active');
        currentPanel.style.display = 'none';
        if (currentContent) {
            currentContent.style.opacity = '1';
        }

        nextPanel.classList.add('active');
        nextPanel.style.zIndex = '2000';

        const nextVideo = nextPanel.querySelector('video');
        if (nextVideo) {
            nextVideo.load();
            setTimeout(() => {
                nextVideo.play().then(() => {
                    const playBtn = nextVideo.parentElement.querySelector('.play-btn');
                    if (playBtn) playBtn.classList.add('playing');
                }).catch(err => {
                    console.log('Autoplay prevented:', err);
                    const playBtn = nextVideo.parentElement.querySelector('.play-btn');
                    if (playBtn) playBtn.classList.remove('playing');
                });
            }, 50);
        }
    }, 150);
}


let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;
let isTouchingInfoCard = false;
let canSwipeCards = true;

const MIN_SWIPE_DISTANCE = 50;

function handleTouchStart(e) {
    const target = e.target.closest('.info-card');
    isTouchingInfoCard = !!target;

    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;

    if (isTouchingInfoCard && target) {
        const isAtTop = target.scrollTop === 0;
        const isAtBottom = target.scrollHeight - target.scrollTop === target.clientHeight;
        const isScrollable = target.scrollHeight > target.clientHeight;

        canSwipeCards = !isScrollable || isAtTop || isAtBottom;
    } else {
        canSwipeCards = true;
    }
}

function handleTouchMove(e) {
    if (isTouchingInfoCard) {
        const target = e.target.closest('.info-card');
        if (target && target.scrollHeight > target.clientHeight) {
            const isAtTop = target.scrollTop === 0;
            const isAtBottom = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight) < 1;

            const touchY = e.changedTouches[0].screenY;
            const deltaY = touchY - touchStartY;

            if ((deltaY > 0 && !isAtTop) || (deltaY < 0 && !isAtBottom)) {
                canSwipeCards = false;
                return;
            }
        }
    }
}

function handleTouchEnd(e) {
    if (!canSwipeCards) {
        canSwipeCards = true;
        return;
    }

    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;

    handleSwipeGesture();
}

function handleSwipeGesture() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE) {
            if (deltaX > 0) {
                if (typeof navigateLeft === 'function') {
                    navigateLeft();
                }
            } else {
                if (typeof navigateRight === 'function') {
                    navigateRight();
                }
            }
        }
    }
}

document.addEventListener('touchstart', handleTouchStart, { passive: true });
document.addEventListener('touchmove', handleTouchMove, { passive: true });
document.addEventListener('touchend', handleTouchEnd, { passive: true });
