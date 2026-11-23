const $ = selector => document.querySelector(selector);

// ==========================================
// LOADING SCREEN
// ==========================================

window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = $('#ld');

        if (loader) loader.classList.add('go');

        document.body.classList.add('go');
    }, 500);
});

// ==========================================
// MARQUEE
// ==========================================

const marquee = $('#mq');

if (marquee) {
    marquee.innerHTML = (
        'Haircuts<span>✂</span>Beard grooming<span>✂</span>Precision styling<span>✂</span>Classic cuts<span>✂</span>'
    ).repeat(8);
}

// ==========================================
// SCROLL REVEAL
// ==========================================

const revealElements = document.querySelectorAll('.rv');

if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(element => observer.observe(element));
} else {
    revealElements.forEach(element => element.classList.add('in'));
}

// ==========================================
// GOOGLE RATING COUNTERS
// ==========================================

document.querySelectorAll('[data-n]').forEach(element => {
    const number = Number(element.dataset.n);

    element.textContent = Number.isInteger(number)
        ? number
        : number.toFixed(1);
});

// ==========================================
// GOOGLE REVIEWS
// ==========================================

const REVIEWS = [
    {
        name: 'Seba Joe Salloum',
        text: 'Hands down one of the best barber shops around! The quality, attention to detail, and professionalism are on another level. Every visit you get a fresh, clean, and perfect cut. If you haven’t tried this place yet, definitely come check it out — you won’t be disappointed. Best cuts, best service, every time! 💈🔥'
    },
    {
        name: 'Paul King',
        text: 'An incredible five-star experience! The barbers here are true masters of their craft, showing incredible skill, attention to detail, and a great eye for what suits you best. The atmosphere is welcoming, the service is top-notch.'
    },
    {
        name: 'Mikel Tohme',
        text: 'Amazing service and professional work. The barber was friendly, the shop is clean and has a great atmosphere.'
    }
];

let currentReview = 0;
let reviewInterval;

function showReview(index) {
    const quote = $('#rq');
    const name = $('#rn');
    const dots = $('#rd');

    if (!quote || !name || !dots) return;

    currentReview = index;

    quote.textContent = REVIEWS[index].text;
    name.textContent = REVIEWS[index].name;

    [...dots.children].forEach((dot, i) => {
        dot.classList.toggle('on', i === index);
    });
}

function initializeReviews() {
    const dots = $('#rd');

    if (!dots) return;

    dots.innerHTML = '';

    REVIEWS.forEach((review, index) => {
        const dot = document.createElement('button');

        dot.type = 'button';
        dot.setAttribute('aria-label', `Show review by ${review.name}`);

        dot.addEventListener('click', () => {
            showReview(index);

            clearInterval(reviewInterval);
            startReviewRotation();
        });

        dots.appendChild(dot);
    });

    showReview(0);
    startReviewRotation();
}

function startReviewRotation() {
    clearInterval(reviewInterval);

    reviewInterval = setInterval(() => {
        const nextReview = (currentReview + 1) % REVIEWS.length;
        showReview(nextReview);
    }, 6000);
}

initializeReviews();

// ==========================================
// BOOKING SYSTEM
// ==========================================

const S = {
    barber: '',
    service: '',
    time: ''
};

const BARBERS = [
    'Maher',
    'Najem',
    'Majed',
    'Any barber'
];

const SERVICES = [
    'Haircut',
    'Beard',
    'Haircut + Beard'
];

const BARBER_ALIASES = {
    'Maher': ['maher', 'maher nayef'],
    'Najem': ['najem'],
    'Majd': ['majd']
};

// ==========================================
// SERVICE DURATIONS
// ==========================================

function getDuration(service) {
    const s = String(service || '').toLowerCase().trim();

    if (
        s.includes('haircut + beard') ||
        s.includes('haircut and beard') ||
        s.includes('cut and beard')
    ) {
        return 45;
    }

    if (s === 'beard' || s.includes('beard')) {
        return 15;
    }

    return 30;
}

// ==========================================
// DATE AND TIME HELPERS
// ==========================================

function pad(number) {
    return String(number).padStart(2, '0');
}

function formatDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function timeToMinutes(time) {
    const parts = String(time).split(':');

    return Number(parts[0]) * 60 + Number(parts[1]);
}

function barberMatches(assignedBarber, requestedBarber) {
    const assigned = String(assignedBarber || '')
        .trim()
        .toLowerCase();

    const aliases = BARBER_ALIASES[requestedBarber] || [
        String(requestedBarber || '').toLowerCase()
    ];

    return aliases.includes(assigned);
}

// ==========================================
// CREATE BARBER AND SERVICE BUTTONS
// ==========================================

function createChips(selector, options, key) {
    const container = $(selector);

    if (!container) return;

    container.innerHTML = '';

    options.forEach(option => {
        const button = document.createElement('button');

        button.type = 'button';
        button.textContent = option;

        button.addEventListener('click', () => {
            S[key] = option;

            [...container.children].forEach(child => {
                child.classList.toggle('on', child === button);
            });

            updateSummary();

            if (key === 'barber' || key === 'service') {
                createTimeSlots();
            }
        });

        container.appendChild(button);
    });
}

createChips('#cb', BARBERS, 'barber');
createChips('#cs', SERVICES, 'service');

// ==========================================
// DATE
// ==========================================

const dateInput = $('#bd');

if (dateInput) {
    const today = new Date();

    dateInput.min = formatDate(today);
    dateInput.value = formatDate(today);
}

// ==========================================
// GET CONFIRMED BOOKINGS FROM SUPABASE
// ==========================================

async function getConfirmedBookings(date) {
    if (!window.supabaseClient) {
        throw new Error('Supabase client unavailable.');
    }

    const { data, error } = await window.supabaseClient.rpc(
        'get_confirmed_availability',
        {
            target_date: date
        }
    );

    if (error) throw error;

    return data || [];
}

// ==========================================
// CHECK IF A BARBER IS BUSY
// ==========================================

function isBarberBusy(barber, time, duration, bookings) {
    const newStart = timeToMinutes(time);
    const newEnd = newStart + duration;

    return bookings.some(booking => {
        if (!barberMatches(booking.assigned_barber, barber)) {
            return false;
        }

        const existingStart = timeToMinutes(
            booking.appointment_time
        );

        const existingDuration = Number(
            booking.duration_minutes || 30
        );

        const existingEnd = existingStart + existingDuration;

        return (
            newStart < existingEnd &&
            newEnd > existingStart
        );
    });
}

// ==========================================
// CHECK AVAILABILITY
// ==========================================

function isTimeAvailable(time, bookings) {
    const duration = getDuration(S.service);

    if (S.barber === 'Any barber') {
        const availableBarbers = BARBERS.filter(
            barber => barber !== 'Any barber'
        );

        return availableBarbers.some(barber =>
            !isBarberBusy(barber, time, duration, bookings)
        );
    }

    return !isBarberBusy(
        S.barber,
        time,
        duration,
        bookings
    );
}

// ==========================================
// CREATE TIME SLOTS
// ==========================================

let availabilityRequest = 0;

async function createTimeSlots() {
    const container = $('#ct');

    if (!container || !dateInput) return;

    const requestNumber = ++availabilityRequest;

    container.innerHTML = '';
    S.time = '';

    updateSummary();

    if (!S.barber || !S.service) {
        container.textContent =
            'Choose a barber and service to see available times.';
        return;
    }

    container.textContent = 'Checking availability...';

    let bookings;

    try {
        bookings = await getConfirmedBookings(dateInput.value);
    } catch (error) {
        console.error('Availability error:', error);

        if (requestNumber === availabilityRequest) {
            container.textContent =
                'Could not check availability. Please refresh the page.';
        }

        return;
    }

    if (requestNumber !== availabilityRequest) return;

    container.innerHTML = '';

    const selectedDate = dateInput.value;
    const today = formatDate(new Date());
    const now = new Date();

    for (let minutes = 600; minutes <= 1170; minutes += 30) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        const time = `${pad(hours)}:${pad(mins)}`;

        const button = document.createElement('button');

        button.type = 'button';
        button.textContent = time;

        const alreadyPassed =
            selectedDate === today &&
            minutes <= now.getHours() * 60 + now.getMinutes() + 15;

        const unavailable = !isTimeAvailable(time, bookings);

        if (alreadyPassed || unavailable) {
            button.disabled = true;
            button.classList.add('unavailable');

            if (unavailable) {
                button.title = 'This time is already booked.';
            }
        }

        button.addEventListener('click', () => {
            if (button.disabled) return;

            S.time = time;

            [...container.children].forEach(child => {
                child.classList.toggle('on', child === button);
            });

            updateSummary();
        });

        container.appendChild(button);
    }

    updateSummary();
}

// ==========================================
// DATE CHANGE
// ==========================================

if (dateInput) {
    dateInput.addEventListener('change', createTimeSlots);

    createTimeSlots();
}

// ==========================================
// BOOKING SUMMARY
// ==========================================

function updateSummary() {
    const message = $('#bm');

    if (!message || !dateInput) return;

    if (S.barber && S.service && S.time && dateInput.value) {
        const date = new Date(dateInput.value + 'T00:00')
            .toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long'
            });

        message.textContent =
            `${S.service} with ${S.barber}, ${date} at ${S.time}`;
    } else {
        message.textContent =
            'Pick a barber, service, date and time.';
    }
}

// ==========================================
// SUBMIT BOOKING
// ==========================================

const bookingButton = $('#bg');

if (bookingButton) {
    bookingButton.addEventListener('click', async () => {
        const name = $('#bn').value.trim();
        const phone = $('#bp').value.trim();
        const message = $('#bm');

        if (!S.barber || !S.service || !S.time || !dateInput.value) {
            message.textContent =
                'Please choose a barber, service, date and time first.';
            return;
        }

        if (!name || phone.length < 6) {
            message.textContent =
                'Please add your name and a valid phone number.';
            return;
        }

        if (!window.supabaseClient) {
            message.textContent =
                'Something went wrong. Please try again later.';
            return;
        }

        bookingButton.disabled = true;
        bookingButton.textContent = 'Checking availability...';

        try {
            const latestBookings = await getConfirmedBookings(
                dateInput.value
            );

            if (!isTimeAvailable(S.time, latestBookings)) {
                message.textContent =
                    'Sorry! This time has just been booked. Please choose another time.';

                await createTimeSlots();
                return;
            }

            bookingButton.textContent = 'Submitting...';

            const { error } = await window.supabaseClient
                .from('bookings')
                .insert([{
                    customer_name: name,
                    phone: phone,
                    barber: S.barber,
                    service: S.service,
                    appointment_date: dateInput.value,
                    appointment_time: S.time,
                    status: 'Pending'
                }]);

            if (error) throw error;

            message.textContent =
                'Booking request received! Thank you! Your request has been submitted. We will contact you shortly to confirm your appointment.';

            $('#bn').value = '';
            $('#bp').value = '';

            S.barber = '';
            S.service = '';
            S.time = '';

            document.querySelectorAll(
                '#cb button, #cs button, #ct button'
            ).forEach(button => {
                button.classList.remove('on');
            });

            createTimeSlots();

        } catch (error) {
            console.error('Booking error:', error);

            message.textContent =
                'Could not save your booking. Please try again.';
        } finally {
            bookingButton.disabled = false;
            bookingButton.textContent = 'Send booking request';
        }
    });
}
