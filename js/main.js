const $ = selector => document.querySelector(selector);

// LOADING SCREEN
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = $('#ld');
        if (loader) loader.classList.add('go');
    }, 500);
});

// MARQUEE
const marquee = $('#mq');

if (marquee) {
    marquee.innerHTML = (
        'Fades<span>✂</span>Tapers<span>✂</span>Beard sculpting<span>✂</span>Hot towel finish<span>✂</span>'
    ).repeat(8);
}

// SCROLL REVEAL
const revealElements = document.querySelectorAll('.rv');
revealElements.forEach(element => {
    element.classList.add('in');
});

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

// BOOKING SYSTEM
const S = {
    barber: '',
    service: '',
    time: ''
};

const BARBERS = ['Maher', 'Najem', 'Nayef', 'Any barber'];

const SERVICES = [
    'Signature Haircut',
    'Fade or Taper',
    'Beard Sculpting',
    'Cut and Beard'
];

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
        });

        container.appendChild(button);
    });
}

createChips('#cb', BARBERS, 'barber');
createChips('#cs', SERVICES, 'service');

// DATE AND TIME
const dateInput = $('#bd');

const pad = number => String(number).padStart(2, '0');

const formatDate = date => {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

if (dateInput) {
    const today = new Date();
    dateInput.min = formatDate(today);
    dateInput.value = formatDate(today);
}

function createTimeSlots() {
    const container = $('#ct');
    if (!container || !dateInput) return;

    container.innerHTML = '';
    S.time = '';

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

        if (
            selectedDate === today &&
            minutes <= now.getHours() * 60 + now.getMinutes() + 15
        ) {
            button.disabled = true;
        }

        button.addEventListener('click', () => {
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

if (dateInput) {
    dateInput.addEventListener('change', createTimeSlots);
    createTimeSlots();
}

// BOOKING SUMMARY
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

// SUBMIT BOOKING
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
        bookingButton.textContent = 'Submitting...';

        try {
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

            document.querySelectorAll('#cb button, #cs button, #ct button')
                .forEach(button => button.classList.remove('on'));

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
// GOOGLE RATING COUNTERS
document.querySelectorAll('[data-n]').forEach(element => {
    const number = Number(element.dataset.n);

    element.textContent = Number.isInteger(number)
        ? number
        : number.toFixed(1);
});
