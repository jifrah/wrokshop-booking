document.addEventListener('DOMContentLoaded', function() {
    // Airtable API configuration
    const apiKey = 'patltA4bs1xjUB0EV.ff4082999c1ddee3a0dbb0a497fd56a78666bb9debe065803f4b241b2db02baa';
    const baseId = 'appRON7cSA3jKt3cW';

    const tables = [
        { id: 'j1_creneau_1', elementId: 'slider1' },
        { id: 'j1_creneau_2', elementId: 'slider2' }
    ];

    tables.forEach(table => {
        axios.get(`https://api.airtable.com/v0/${baseId}/${table.id}`, {
            headers: { Authorization: `Bearer ${apiKey}` },
            params: { maxRecords: 20, view: 'Grid view' }
        })
        .then(response => {
            const records = response.data.records;
            records.forEach(record => {
                addCardToSlider(record.fields, table.elementId);
            });
            initializeSwiper(table.elementId);
        })
        .catch(error => {
            console.error(`Error fetching data from Airtable (${table.id}):`, error);
        });
    });

    function addCardToSlider(fields, sliderId) {
        // Create a new card element
        var card = document.createElement('article');
        card.className = 'card__article swiper-slide';

        // Add card content
        card.innerHTML = `
            <div class="card__image">
                <img src="${fields.image[0].url}" alt="image" class="card__img">
                <div class="card__shadow"></div>
            </div>
            <div class="card__data">
                <h3 class="card__name"><center>${fields.name}</center></h3>
                <p class="card__location">
                    <img src="assets/img/location.png" alt="Location Icon" class="location-icon">
                    ${fields.location}
                </p>
                <a href="${fields.link}" class="card__button">S'inscrire</a>
                <p class="card__description">${fields.description}</p>
            </div>
        `;

        // Append the card to the swiper wrapper
        document.querySelector(`#${sliderId} .swiper-wrapper`).appendChild(card);
    }

    function initializeSwiper(sliderId) {
        // Initialize Swiper after adding cards to the DOM
        let swiperCards = new Swiper(`#${sliderId} .card__content`, {
            loop: false,
            spaceBetween: 32,
            grabCursor: true,
            pagination: {
                el: `#${sliderId} .swiper-pagination`,
                clickable: true,
                dynamicBullets: true,
            },
            navigation: {
                nextEl: `#${sliderId} .swiper-button-next`,
                prevEl: `#${sliderId} .swiper-button-prev`,
            },
            breakpoints: {
                600: {
                    slidesPerView: 2,
                },
                968: {
                    slidesPerView: 3,
                },
            },
        });
    }

    // Toggle card description on touch-enabled devices
    document.querySelectorAll('.card__article').forEach((card) => {
        card.addEventListener('click', () => {
            // Check if the device is touch-enabled
            if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
                const description = card.querySelector('.card__description');
                description.style.display = description.style.display === 'block' ? 'none' : 'block';
            }
        });
    });
});
