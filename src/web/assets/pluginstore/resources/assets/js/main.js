import Vue from 'vue';
import VueResource from 'vue-resource';
import lodash from 'lodash'
import VueLodash from 'vue-lodash/dist/vue-lodash.min'

import GlobalModal from './components/GlobalModal';
import { currency } from './filters/currency';
import { t } from './filters/t';
import router from './router';
import store from './store'
import { mapGetters } from 'vuex'

Vue.use(VueResource);
Vue.use(VueLodash, lodash);
Vue.filter('currency', currency)
Vue.filter('t', t)

window.pluginStoreApp = new Vue({
    el: '#main',
    router,
    store,

    components: {
        GlobalModal
    },

    data() {
      return {
          $crumbs: null,
          $pageTitle: null,
          showCrumbs: false,
          pageTitle: 'Plugin Store',
          plugin: null,
          modalStep: null,
          pluginStoreDataLoading: true,
          pluginStoreDataLoaded: false,
          craftIdDataLoading: true,
          craftIdDataLoaded: false,
          showModal: false,
          lastOrder: null,
      }
    },

    computed: {
        ...mapGetters({
            cartPlugins: 'cartPlugins',
        }),
    },

    methods: {
        displayNotice(message) {
            Craft.cp.displayNotice(message);
        },
        displayError(message) {
            Craft.cp.displayError(message);
        },
        showPlugin(plugin) {
            this.plugin = plugin;
            this.openGlobalModal('plugin-details');
        },
        openGlobalModal(modalStep) {
            this.modalStep = modalStep;

            this.showModal = true;
            /*if(!this.modal.visible) {
                this.modal.show();
            }*/
        },
        closeGlobalModal() {
            this.showModal = false;
            // this.modal.hide();
        },
        updateCraftId(craftId) {

            let $accountInfoMenu = $('#account-info').data('menubtn').menu.$container;

            if(craftId) {
                $('.craftid-connected').removeClass('hidden');
                $('.craftid-disconnected').addClass('hidden');

                $('.craftid-connected', $accountInfoMenu).removeClass('hidden');
                $('.craftid-disconnected', $accountInfoMenu).addClass('hidden');


            } else {
                $('.craftid-connected').addClass('hidden');
                $('.craftid-disconnected').removeClass('hidden');

                $('.craftid-connected', $accountInfoMenu).addClass('hidden');
                $('.craftid-disconnected', $accountInfoMenu).removeClass('hidden');
            }

            this.$store.dispatch('updateCraftId', { craftId });
        }
    },

    watch: {
        cartPlugins() {
            if(window.enableCraftId) {
                this.$cartButton.html('Cart (' + this.cartPlugins.length + ')');
            }
        },
        showCrumbs(showCrumbs) {
            if(showCrumbs) {
                this.$crumbs.removeClass('hidden');
            } else {
                this.$crumbs.addClass('hidden');
            }
        },
        pageTitle(pageTitle) {
            this.$pageTitle.html(pageTitle);
        }
    },

    created() {
        // Crumbs

        this.$crumbs = $('#crumbs');

        if(this.$crumbs) {
            if(!this.showCrumbs) {
                this.$crumbs.addClass('hidden')
            }

            let $a = $('a', this.$crumbs);
            let $this = this;

            $a.on('click', (e) => {
                e.preventDefault();
                $this.$router.push({ path: '/'})
            });
        }


        // Page title

        this.$pageTitle = $('#header').find('h1');

        if(this.$pageTitle) {
            this.$pageTitle.html(this.pageTitle)
        }


        // Dispatch actions

        this.$store.dispatch('getCraftData')
            .then(data => {
                this.craftIdDataLoading = false;
                this.craftIdDataLoaded = true;
                this.$emit('craftIdDataLoaded');
            })
            .catch(response => {
                this.craftIdDataLoading = false
                this.craftIdDataLoaded = true;
                this.$emit('craftIdDataLoaded');
            });

        this.$store.dispatch('getPluginStoreData')
            .then(data => {
                this.pluginStoreDataLoading = false;
                this.pluginStoreDataLoaded = true;
                this.$emit('pluginStoreDataLoaded');
            })
            .catch(response => {
                this.pluginStoreDataLoading = false
            });

        this.$store.dispatch('getCartState')
    },

    mounted() {

        let $this = this;

        if(window.enableCraftId) {

            // Cart Button

            this.$cartButton = $('#cart-button')

            this.$cartButton.on('click', (e) => {
                e.preventDefault();
                $this.openGlobalModal('cart');
            });


            // Payment button

            let $paymentButton = $('#payment-button');

            $paymentButton.on('click', (e) => {
                e.preventDefault();
                $this.openGlobalModal('payment');
            });


            // reset-cart-button

            let $resetCartButton = $('#reset-cart-button');

            $resetCartButton.on('click', (e) => {
                e.preventDefault();
                this.$store.dispatch('resetCart');
            });
        }
    },
});