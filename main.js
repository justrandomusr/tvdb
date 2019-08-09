const TAB_URLS = ["watching", "finished", "planned", "on_hold", "dropped"];

const GUEST = {
    userID: -1,
    auth: "null",
    langID: 1,
    username: "Guest",
    avatar: "http://potsdam-moodle.de/e109631/tvdb/res/no_avatar.png",
    role: 0
};

var app, router;

window.onload = function() {
    axios.defaults.baseURL = 'http://potsdam-moodle.de/e109631/tvdb/api';
    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

    Vue.prototype.$const = {};

    Vue.component("user-list-item", {
        props: ["entry", "index"],
        data: function() {
            return {
                select: null
            }
        },
        template: document.getElementById("user-list-item-template").text,
        watch: {
            "entry": function() {
                this.select.destroy();
                this.select = M.FormSelect.init(this.$el.getElementsByTagName("select")[0]);
                this.select.input.disabled = this.$route.params.userID != this.$root.user.userID;
            }
        },
        mounted: function() {
            this.select = M.FormSelect.init(this.$el.getElementsByTagName("select")[0]);
            this.select.input.disabled = this.$route.params.userID != this.$root.user.userID;
        },
        beforeDestroy: function() {
            this.select.destroy();
        },
        methods: {
            updateValue: function(type, event, index) {
                var num = Number(event.target.value.replace(",", "."));
                var instance = this;

                if(!isNaN(num) && num > 0 && num <= 10) {
                    this.$parent.dataset[TAB_URLS[this.$parent.tab]][index][type] = num;

                    event.target.classList.remove("invalid");
                    event.target.disabled = true;

                    axios.post("/user/list_modify", Qs.stringify({
                        token: app.user.auth,
                        series_id: this.$props.entry.seriesID,
                        field: type,
                        value: num
                    }))
                    .then(function(response) {
                        if(!response.data.success) {
                            M.toast({html: "Update failed!"});
                            return;
                        }

                        if(type == "progress" && num >= instance.$props.entry.episodes) {
                            instance.$parent.move({target: {value: instance.$const.LIST_TAB_FINISHED }}, index);
                        }

                        event.target.disabled = false;
                    })
                    .catch(function(error) {
                        console.log(error);
                        M.toast({html: "Update failed!"});
                        event.target.disabled = false;
                    });
                }
                else {
                    event.target.classList.add("invalid");
                }
            },
            remove: function(index) {
                var instance = this;

                axios.post("/user/list_remove", Qs.stringify({
                    token: app.user.auth,
                    series_id: this.$props.entry.seriesID
                }))
                .then(function(response) {
                    if(!response.data.success) {
                        M.toast({html: "Could not remove!"});
                        return;
                    }

                    instance.$parent.dataset[TAB_URLS[instance.$parent.tab]].splice(index, 1);
                })
                .catch(function(error) {
                    console.log(error);
                    M.toast({html: "Could not remove!"});
                });
            }
        }
    });

    Vue.component("series-component", {
        props: ["series", "small"],
        data: function() {
            return {
                series_image: {
                    backgroundImage:  "url('" + this.$props.series.image + "')"
                }
            };
        },
        template: document.getElementById("series-component-template").text,
        methods: {
            toSeries: function() {
                this.$router.push("/series/" + this.$props.series.seriesID);
            }
        }
    });

    Vue.component("character-component", {
        props: ["character", "small"],
        data: function() {
            return {
                character_image: {
                    backgroundImage:  "url('" + this.$props.character.image + "')"
                }
            };
        },
        template: document.getElementById("character-component-template").text,
        methods: {
            toCharacter: function() {
                this.$router.push("/character/" + this.$props.character.characterID);
            }
        }
    });

    Vue.component("episode-component", {
        props: ["episode"],
        template: document.getElementById("episode-component-template").text,
        methods: {
            toEpisode: function() {
                this.$router.push("/episode/" + this.$props.episode.episodeID);
            }
        }
    });

    Vue.component("user-component", {
        props: ["user"],
        data: function() {
            return {
                user_image: {
                    backgroundImage:  "url('" + this.$props.user.avatar + "')"
                }
            };
        },
        template: document.getElementById("user-component-template").text,
        methods: {
            toUser: function() {
                this.$router.push("/user/" + this.$props.user.userID);
            }
        }
    });

    router = new VueRouter({
        routes: [
            { path: "/home", component: Home, name: "home" },
            { path: "/users", component: Users, name: "users" },
            { path: "/user/:userID", component: UserPage, name: "user_page" },
            { path: "/user/:userID/list/:tab", component: UserList, name: "user_list" },
            { path: "/series/:year/:genre", component: Series, name: "series" },
            { path: "/series/:seriesID", component: SeriesPage, name: "series_page" },
            { path: "/characters", component: Characters, name: "characters" },
            { path: "/character/:characterID", component: CharacterPage, name: "character_page" },
            { path: "/episode/:episodeID", component: EpisodePage, name: "episode_page" }
        ]
    });

    app = new Vue({
        router: router,
        el: "#app",
        data: {
            user: GUEST,
            user_list: null,
            prefer_native_names: false,
            res: "http://potsdam-moodle.de/e109631/tvdb/res/",
            languages: [],
            languageModal: null,
            translateModal: null,
            translateObject: null,
            translateType: null,
            translateLanguage: null,
            translateValue: "",
            genres: [],
            genreModal: null,
            genreSeries: null,
            episodeModal: null,
            episodeSeries: null,
            episodeNumber: null,
            episodeLink: "",
            characterModal: null,
            characterSeries: null,
            characterID: null,
            relationTypeModal: null,
            relationSeriesA: null,
            relationSeriesB: null,
            relationType: null,
            relationModal: null,
            seriesLanguageModal: null,
            seriesLanguage: null,
            seriesModal: null,
            seriesYear: null,
            seriesImage: "http://potsdam-moodle.de/e109631/tvdb/res/no_series.png",
            characterAddModal: null,
            characterBirthday: null,
            characterImage: "http://potsdam-moodle.de/e109631/tvdb/res/no_character.png",
            userLanguageModal: null
        },
        created: function() {
            this.$const.PAGE_HOME = "home";
            this.$const.PAGE_USER_LIST = "user_list";
            this.$const.PAGE_SERIES = "series";
            this.$const.PAGE_SERIES_PAGE = "series_page";
            this.$const.PAGE_CHARACTERS = "characters";
            this.$const.PAGE_CHARACTER_PAGE = "character_page";
            this.$const.PAGE_EPISODE_PAGE = "episode_page";
            this.$const.PAGE_USER_PAGE = "user_page";
            this.$const.PAGE_USERS = "users";
            this.$const.LIST_TAB_WATCHING = 0;
            this.$const.LIST_TAB_FINISHED = 1;
            this.$const.LIST_TAB_PLANNED = 2;
            this.$const.LIST_TAB_ON_HOLD = 3;
            this.$const.LIST_TAB_DROPPED = 4;
        },
        mounted: function() {
            this.languageModal = M.Modal.init(document.getElementById("language-modal"));
            this.translateModal = M.Modal.init(document.getElementById("translate-modal"));
            this.genreModal = M.Modal.init(document.getElementById("genre-modal"));
            this.episodeModal = M.Modal.init(document.getElementById("episode-modal"));
            this.characterModal = M.Modal.init(document.getElementById("character-modal"));
            this.relationTypeModal = M.Modal.init(document.getElementById("relation-type-modal"));
            this.relationModal = M.Modal.init(document.getElementById("relation-modal"));
            this.seriesLanguageModal = M.Modal.init(document.getElementById("series-language-modal"));
            this.seriesModal = M.Modal.init(document.getElementById("series-modal"));
            this.characterAddModal = M.Modal.init(document.getElementById("character-add-modal"));
            this.userLanguageModal = M.Modal.init(document.getElementById("user-language-modal"));
        },
        beforeDestroy: function() {
            this.languageModal.destroy();
            this.translateModal.destroy();
            this.genreModal.destroy();
            this.episodeModal.destroy();
            this.characterModal.destroy();
            this.relationTypeModal.destroy();
            this.relationModal.destroy();
            this.seriesLanguageModal.destroy();
            this.seriesModal.destroy();
            this.characterAddModal.destroy();
            this.userLanguageModal.destroy();
        },
        computed: {
            strings: function() {
                for(var i = 0; i < LOCALIZATION.length; i++) {
                    if(LOCALIZATION[i].id == this.user.langID) {
                        return LOCALIZATION[i].strings;
                    }
                }
                return LOCALIZATION[0].strings;
            }
        },
        methods: {
            fetchUserList: function(instance, userID) {
                axios.post("/user/user_list", Qs.stringify({
                    user_id: userID,
                    token: this.$root.user.auth
                }))
                .then(function(response) {
                    instance.own_dataset.watching = response.data.watching || [];
                    instance.own_dataset.finished = response.data.finished || [];
                    instance.own_dataset.planned = response.data.planned || [];
                    instance.own_dataset.on_hold = response.data.on_hold || [];
                    instance.own_dataset.dropped = response.data.dropped || [];

                    if(userID == app.user.userID) {
                        app.user_list = JSON.parse(JSON.stringify(instance.own_dataset));
                    }
                })
                .catch(function(error) {
                    console.log(error);
                });
            },
            mapLanguage: function(langID) {
                for(let language of this.languages) {
                    if(language.langID == langID) {
                        return language.name;
                    }
                }
            },
            translate: function(objectID, objectType) {
                this.translateObject = objectID;
                this.translateType = objectType;
                this.languageModal.open();
            },
            languageSelected: function(langID) {
                this.translateLanguage = langID;

                axios.post("/translation/get", Qs.stringify({
                    token: app.user.auth,
                    object_id: this.translateObject,
                    object_type: this.translateType,
                    language_id: langID
                }))
                .then(function(response) {
                    app.languageModal.close();
                    app.translateValue = response.data.value;
                    app.translateModal.open();
                })
                .catch(function(error) {
                    console.log(error);
                });
            },
            doTranslate: function() {
                axios.post("/translation/translate", Qs.stringify({
                    token: app.user.auth,
                    object_id: this.translateObject,
                    object_type: this.translateType,
                    language_id: this.translateLanguage,
                    value: this.translateValue
                }))
                .then(function(response) {
                    if(!response.data.success) {
                        M.toast({html: "Translate failed!"});
                        return;
                    }
    
                    app.translateModal.close();
                    router.go();
                })
                .catch(function(error) {
                    console.log(error);
                    M.toast({html: "Translate failed!"});
                });
            },
            addGenre: function(genreID) {
                axios.post("/series/genre_add", Qs.stringify({
                    token: app.user.auth,
                    series_id: this.genreSeries,
                    genre_id: genreID
                }))
                .then(function(response) {
                    if(!response.data.success) {
                        M.toast({html: "Adding genre failed!"});
                        return;
                    }
    
                    app.genreModal.close();
                    router.go();
                })
                .catch(function(error) {
                    console.log(error);
                    M.toast({html: "Adding genre failed!"});
                });
            },
            addEpisode: function() {
                axios.post("/episode/add", Qs.stringify({
                    token: app.user.auth,
                    series_id: this.episodeSeries,
                    number: this.episodeNumber,
                    link: this.episodeLink
                }))
                .then(function(response) {
                    if(!response.data.success) {
                        M.toast({html: "Adding episode failed!"});
                        return;
                    }
    
                    app.episodeModal.close();
                    router.push("/episode/" + response.data.episodeID);
                })
                .catch(function(error) {
                    console.log(error);
                    M.toast({html: "Adding episode failed!"});
                });
            },
            addCharacterSeries: function() {
                axios.post("/series/character_add", Qs.stringify({
                    token: app.user.auth,
                    series_id: this.characterSeries,
                    character_id: this.characterID
                }))
                .then(function(response) {
                    if(!response.data.success) {
                        M.toast({html: "Adding character failed!"});
                        return;
                    }
    
                    app.characterModal.close();
                    router.go();
                })
                .catch(function(error) {
                    console.log(error);
                    M.toast({html: "Adding character failed!"});
                });
            },
            setRelationType: function(type) {
                this.relationType = type;
                app.relationTypeModal.close();
                app.relationModal.open();
            },
            addRelation: function() {
                axios.post("/series/relation_add", Qs.stringify({
                    token: app.user.auth,
                    series_id_a: this.relationSeriesA,
                    series_id_b: this.relationSeriesB,
                    relation_type: this.relationType
                }))
                .then(function(response) {
                    if(!response.data.success) {
                        M.toast({html: "Adding relation failed!"});
                        return;
                    }
    
                    app.relationModal.close();
                    router.go();
                })
                .catch(function(error) {
                    console.log(error);
                    M.toast({html: "Adding relation failed!"});
                });
            },
            setSeriesLanguage: function(language) {
                this.seriesLanguage = language;
                this.seriesLanguageModal.close();
                this.seriesModal.open();
            },
            addSeries: function() {
                axios.post("/series/add", Qs.stringify({
                    token: app.user.auth,
                    language_id: this.seriesLanguage,
                    year: this.seriesYear,
                    image: this.seriesImage
                }))
                .then(function(response) {
                    if(!response.data.success) {
                        M.toast({html: "Adding series failed!"});
                        return;
                    }
    
                    app.seriesModal.close();
                    router.push("/series/" + response.data.seriesID);
                })
                .catch(function(error) {
                    console.log(error);
                    M.toast({html: "Adding series failed!"});
                });
            },
            addCharacter: function() {
                axios.post("/character/add", Qs.stringify({
                    token: app.user.auth,
                    birthday: this.characterBirthday,
                    image: this.characterImage
                }))
                .then(function(response) {
                    if(!response.data.success) {
                        M.toast({html: "Adding character failed!"});
                        return;
                    }
    
                    app.characterAddModal.close();
                    router.push("/character/" + response.data.characterID);
                })
                .catch(function(error) {
                    console.log(error);
                    M.toast({html: "Adding character failed!"});
                });
            },
            selectUserLanguage: function() {
                this.userLanguageModal.open();
            },
            setUserLanguage: function(language) {
                axios.post("/user/set_language", Qs.stringify({
                    token: app.user.auth,
                    language: language
                }))
                .then(function(response) {
                    if(!response.data.success) {
                        M.toast({html: "Language change failed!"});
                        return;
                    }
    
                    app.userLanguageModal.close();
                    router.go();
                })
                .catch(function(error) {
                    console.log(error);
                    M.toast({html: "Language change failed!"});
                });
            }
        }
    });

    var storedToken = localStorage.getItem("token");
    if(storedToken) {
        axios.post("/user/refresh", Qs.stringify({
                token: storedToken
            }))
            .then(function(response) {
                if(!response.data.success) {
                    M.toast({html: "Login failed"});
                    localStorage.removeItem("token");

                    if(router.currentRoute.name == null) {
                        router.replace("/home");
                    }
                    return;
                }

                localStorage.setItem("token", response.data.auth);
                app.user = response.data;

                if(router.currentRoute.name == null || router.currentRoute.name == app.$const.PAGE_HOME) {
                    router.replace("/user/" + app.user.userID + "/list/watching");
                }
                else if(router.currentRoute.name != app.$const.PAGE_USER_LIST) {
                    app.fetchUserList({own_dataset: {}}, app.user.userID);
                }
            })
            .catch(function(error) {
                console.log(error);
                M.toast({html: "Login failed"});
                localStorage.removeItem("token");


                if(router.currentRoute.name == null) {
                    router.replace("/home");
                }
            });
    }
    else {
        if(router.currentRoute.name == null) {
            router.replace("/home");
        }
    }

    axios.post("/translation/languages")
        .then(function(response) {
            app.languages = response.data;
        })
        .catch(function(error) {
            console.log(error);
        });
    
    axios.post("/series/genres")
        .then(function(response) {
            app.genres = response.data;
        })
        .catch(function(error) {
            console.log(error);
        });
}

/*
  Router components
*/

const Home = {  // home = registration/login
    template: document.getElementById("home-template").text,
    data: function() {
        return {
            username: "",
            password: ""
        }
    },
    mounted: function() {
        if(app && app.user.userID != -1) {
            router.replace("/user/" + app.user.userID + "/list/watching");
        }
    },
    methods: {
        login: function() {
            axios.post("/user/login", Qs.stringify({
                username: this.username,
                pass: this.password
            }))
            .then(function(response) {
                if(!response.data.success) {
                    M.toast({html: "Invalid credentials!"});
                    return;
                }

                localStorage.setItem("token", response.data.auth);
                app.user = response.data;

                router.replace("/user/" + app.user.userID + "/list/watching");
            })
            .catch(function(error) {
                console.log(error);
                M.toast({html: "Login failed"});
            });
        },
        register: function() {
            var instance = this;

            axios.post("/user/register", Qs.stringify({
                username: this.username,
                pass: this.password
            }))
            .then(function(response) {
                if(!response.data.success) {
                    M.toast({html: "User already exists!"});
                    return;
                }

                instance.login();
            })
            .catch(function(error) {
                console.log(error);
                M.toast({html: "Registration failed"});
            });
        }
    }
};

const UserList = {  // a user's watchlist
    template: document.getElementById("user-list-template").text,
    data: function() {
        return {
            tab: TAB_URLS.indexOf(this.$route.params.tab),
            own_dataset: {watching: [], finished: [], planned: [], on_hold: [], dropped: []},
            userID: null
        }
    },
    created: function() {
        this.fetch();
    },
    watch: {
        "$route": function(route) {
            if(route.params.userID != this.userID) {
                this.userID = route.params.userID;
                this.fetch();
            }
            
            this.tab = TAB_URLS.indexOf(route.params.tab);
        },
        "$root.user": function() {
            this.fetch();
        }
    },
    computed: {
        dataset: function() {
            if(this.$route.params.userID == this.$root.user.userID) {
                return this.$root.user_list;
            }
            else {
                return this.own_dataset;
            }
        },
        currentData: function() {
            if(this.dataset == null) {
                return [];
            }
            return this.dataset[TAB_URLS[this.tab]].sort(function(el1, el2) {
                return el1.name > el2.name ? -1 : 1;
            });
        }
    },
    methods: {
        fetch: function() {
            this.userID = this.$route.params.userID;
            if(this.$route.params.userID == this.$root.user.userID && this.$root.user_list != null) {
                return;
            }

            this.$root.fetchUserList(this, this.$route.params.userID);
        },
        toSeries: function(seriesID) {
            router.push("/series/" + seriesID);
        },
        move: function(event, index) {
            var instance = this;
            var element = this.dataset[TAB_URLS[this.tab]][index];

            axios.post("/user/list_modify", Qs.stringify({
                token: app.user.auth,
                series_id: element.seriesID,
                field: "state",
                value: event.target.value
            }))
            .then(function(response) {
                if(!response.data.success) {
                    M.toast({html: "State change failed!"});
                    return;
                }

                instance.dataset[TAB_URLS[event.target.value]].push(element);
                instance.dataset[TAB_URLS[instance.tab]].splice(index, 1);
            })
            .catch(function(error) {
                console.log(error);
                M.toast({html: "State change failed!"});
            });
        }
    }
};

// Series tab

const Series = {
    template: document.getElementById("series-list-template").text,
    data: function() {
        return {
            dataset: [],
            genre: -1,
            year: -1,
            genreSelect: null,
            yearSelect: null
        }
    },
    mounted: function() {
        this.yearSelect = M.FormSelect.init(document.getElementById("year-select"));
        this.genreSelect = M.FormSelect.init(document.getElementById("genre-select"));
        this.fetch();
    },
    beforeDestroy: function() {
        this.yearSelect.destroy();
        this.genreSelect.destroy();
    },
    watch: {
        "$root.user": function() {
            this.fetch()
        },
        "$route": function(route) {
            this.fetch();
        }
    },
    methods: {
        fetch: function() {
            var instance = this;

            var obj = { token: this.$root.user.auth };

            var year = Number(router.currentRoute.params.year);
            var genre = Number(router.currentRoute.params.genre);

            if(isNaN(year)) {
                this.year = -1;
            }
            else {
                this.year = year;
                obj["year"] = this.year;
            }

            if(isNaN(genre)) {
                this.genre = -1;
            }
            else {
                this.genre = genre;
                obj["genre"] = this.genre;
            }

            this.yearSelect.el.value = this.year;
            this.genreSelect.el.value = this.genre;

            this.yearSelect.destroy();
            this.genreSelect.destroy();
            this.yearSelect = M.FormSelect.init(document.getElementById("year-select"));
            this.genreSelect = M.FormSelect.init(document.getElementById("genre-select"));

            axios.post("/series/list", Qs.stringify(obj))
            .then(function(response) {
                instance.dataset = response.data;
            })
            .catch(function(error) {
                console.log(error);
            });
        },
        switchGenre: function(event) {
            router.push("/series/" + (this.year == -1 ? "any" : this.year) + "/" + (event.target.value == -1 ? "any" : event.target.value));
        },
        switchYear: function(event) {
            router.push("/series/" + (event.target.value == -1 ? "any" : event.target.value) + "/" + (this.genre == -1 ? "any" : this.genre));
        },
        addSeries: function() {
            this.$root.seriesLanguageModal.open();
        }
    }
};

const SeriesPage = {
    template: document.getElementById("series-page-template").text,
    data: function() {
        return {
            series: {
                seriesID: -1,
                image: "no-series",
                name: "",
                originalName: "",
                description: "",
                summary: "",
                rating: 0,
                year: 1970,
                genres: [],
                characters: [],
                epsiodes: [],
                relations: {},
                stats: {}
            },
            imageInstance: null,
            showSummary: false,
            listPlace: "",
            listUrl: "planned"
        }
    },
    computed: {
        inList: function() {
            for(let key in this.$root.user_list) {
                for(let entry of this.$root.user_list[key]) {
                    if(entry.seriesID == this.series.seriesID) {
                        switch (key) {
                            case TAB_URLS[0]:
                                this.listPlace = this.$root.strings.user_list_watching;
                                break;
                            case TAB_URLS[1]:
                                this.listPlace = this.$root.strings.user_list_finished;
                                break;
                            case TAB_URLS[3]:
                                this.listPlace = this.$root.strings.user_list_on_hold;
                                break;
                            case TAB_URLS[4]:
                                this.listPlace = this.$root.strings.user_list_dropped;
                                break;
                            default:
                                this.listPlace = this.$root.strings.user_list_planned;
                                break;
                        }

                        this.listUrl = key;

                        return true;
                    }
                }
            }
            return false;
        },
    },
    created: function() {
        this.fetch();
    },
    mounted: function() {
        this.imageInstance = M.Materialbox.init(document.getElementsByClassName("materialboxed")[0]);
    },
    beforeDestroy: function() {
        this.imageInstance.destroy();
    },
    watch: {
        "$route": function() {
            this.fetch();
        },
        "$root.user": function() {
            this.fetch();
        }
    },
    methods: {
        fetch: function() {
            var instance = this;

            axios.post("/series/get", Qs.stringify({
                token: this.$root.user.auth,
                series_id: this.$route.params.seriesID
            }))
            .then(function(response) {
                instance.series = response.data;
            })
            .catch(function(error) {
                console.log(error);
            });
        },
        addOrEdit: function() {
            var instance = this;

            if(this.inList) {
                router.push("/user/" + app.user.userID + "/list/" + this.listUrl);
            }
            else {
                axios.post("/user/list_add", Qs.stringify({
                    token: this.$root.user.auth,
                    series_id: this.series.seriesID
                }))
                .then(function(response) {
                    if(!response.data.success) {
                        M.toast("Adding failed!");
                        return;
                    }

                    instance.series.stats.planned = (instance.series.stats.planned || 0) + 1;
                    app.user_list.planned.push(response.data.entry);
                })
                .catch(function(error) {
                    console.log(error);
                    M.toast("Adding failed!");
                });
            }
        },
        removeGenre: function(genreID) {
            axios.post("/series/genre_remove", Qs.stringify({
                token: this.$root.user.auth,
                series_id: this.series.seriesID,
                genre_id: genreID
            }))
            .then(function(response) {
                if(!response.data.success) {
                    M.toast("Remove failed!");
                    router.go();
                }
            })
            .catch(function(error) {
                console.log(error);
                M.toast("Remove failed!");
            });
        },
        addGenre: function() {
            this.$root.genreSeries = this.series.seriesID;
            this.$root.genreModal.open();
        },
        addEpisode: function() {
            this.$root.episodeSeries = this.series.seriesID;
            this.$root.episodeModal.open();
        },
        removeCharacter: function(characterID) {
            axios.post("/series/character_remove", Qs.stringify({
                token: this.$root.user.auth,
                series_id: this.series.seriesID,
                character_id: characterID
            }))
            .then(function(response) {
                if(!response.data.success) {
                    M.toast("Remove failed!");
                }
                router.go();
            })
            .catch(function(error) {
                console.log(error);
                M.toast("Remove failed!");
            });
        },
        addCharacter: function() {
            this.$root.characterSeries = this.series.seriesID;
            this.$root.characterModal.open();
        },
        removeRelation: function(seriesIDB) {
            axios.post("/series/relation_remove", Qs.stringify({
                token: this.$root.user.auth,
                series_id_a: this.series.seriesID,
                series_id_b: seriesIDB
            }))
            .then(function(response) {
                if(!response.data.success) {
                    M.toast("Remove failed!");
                }
                router.go();
            })
            .catch(function(error) {
                console.log(error);
                M.toast("Remove failed!");
            });
        },
        addRelation: function() {
            this.$root.relationSeriesA = this.series.seriesID;
            this.$root.relationTypeModal.open();
        },
        remove: function() {
            axios.post("/series/delete", Qs.stringify({
                token: this.$root.user.auth,
                series_id: this.series.seriesID
            }))
            .then(function(response) {
                if(!response.data.success) {
                    M.toast("Delete failed!");
                    return;
                }

                router.replace("/series/any/any");
            })
            .catch(function(error) {
                console.log(error);
                M.toast("Delete failed!");
            });
        }
    }
};

// Characters tab

const Characters = {
    template: "<div style='display: flex; flex-wrap: wrap;'><character-component v-for='entry in dataset' :character='entry' :small='false' :key='entry.characterID' /><div v-if='$root.user.role > 0' class='chip' @click='addCharacter'><i class='material-icons'>add</i></div></div>",
    data: function() {
        return {
            dataset: []
        }
    },
    created: function() {
        this.fetch();
    },
    watch: {
        "$root.user": function() {
            this.fetch()
        }
    },
    methods: {
        fetch: function() {
            var instance = this;

            axios.post("/character/list", Qs.stringify({
                token: this.$root.user.auth
            }))
            .then(function(response) {
                instance.dataset = response.data;
            })
            .catch(function(error) {
                console.log(error);
            });
        },
        addCharacter: function() {
            this.$root.characterAddModal.open();
        }
    }
};

const CharacterPage = {
    template: document.getElementById("character-page-template").text,
    data: function() {
        return {
            character: {
                characterID: -1,
                image: "no-character",
                name: "",
                originalName: "",
                description: "",
                birthday: "",
                series: []
            },
            imageInstance: null
        }
    },
    created: function() {
        this.fetch();
    },
    mounted: function() {
        this.imageInstance = M.Materialbox.init(document.getElementsByClassName("materialboxed")[0]);
    },
    beforeDestroy: function() {
        this.imageInstance.destroy();
    },
    watch: {
        "$route": function() {
            this.fetch();
        },
        "$root.user": function() {
            this.fetch();
        }
    },
    methods: {
        fetch: function() {
            var instance = this;

            axios.post("/character/get", Qs.stringify({
                token: this.$root.user.auth,
                character_id: this.$route.params.characterID
            }))
            .then(function(response) {
                instance.character = response.data;
            })
            .catch(function(error) {
                console.log(error);
            });
        },
        remove: function() {
            axios.post("/character/delete", Qs.stringify({
                token: this.$root.user.auth,
                character_id: this.character.characterID
            }))
            .then(function(response) {
                if(!response.data.success) {
                    M.toast("Delete failed!");
                    return;
                }

                router.replace("/characters");
            })
            .catch(function(error) {
                console.log(error);
                M.toast("Delete failed!");
            });
        }
    }
};

// Episode

const EpisodePage = {
    template: document.getElementById("episode-page-template").text,
    data: function() {
        return {
            episode: {
                episodeID: -1,
                name: "",
                originalName: "",
                number: 0,
                description: "",
                link: null,
                series: {
                    seriesID: -1,
                    image: "no-series",
                    name: "",
                    originalName: ""
                }
            }
        }
    },
    created: function() {
        this.fetch();
    },
    watch: {
        "$route": function() {
            this.fetch();
        },
        "$root.user": function() {
            this.fetch();
        }
    },
    methods: {
        fetch: function() {
            var instance = this;

            axios.post("/episode/get", Qs.stringify({
                token: this.$root.user.auth,
                episode_id: this.$route.params.episodeID
            }))
            .then(function(response) {
                instance.episode = response.data;
            })
            .catch(function(error) {
                console.log(error);
            });
        },
        remove: function() {
            var instance = this;

            axios.post("/episode/delete", Qs.stringify({
                token: this.$root.user.auth,
                episode_id: this.episode.episodeID
            }))
            .then(function(response) {
                if(!response.data.success) {
                    M.toast("Delete failed!");
                    return;
                }

                router.replace("/series/" + instance.episode.series.seriesID);
            })
            .catch(function(error) {
                console.log(error);
                M.toast("Delete failed!");
            });
        }
    }
};

// Users Tab

const Users = {
    template: "<div style='display: flex; flex-wrap: wrap;'><user-component v-for='entry in dataset' :user='entry' :key='entry.userID' /></div>",
    data: function() {
        return {
            dataset: []
        }
    },
    created: function() {
        this.fetch();
    },
    watch: {
        "$root.user": function() {
            this.fetch()
        }
    },
    methods: {
        fetch: function() {
            var instance = this;

            axios.post("/user/list", Qs.stringify({
                token: this.$root.user.auth
            }))
            .then(function(response) {
                instance.dataset = response.data;
            })
            .catch(function(error) {
                console.log(error);
            });
        }
    }
};

const UserPage = {
    template: document.getElementById("profile-template").text,
    data: function() {
        return {
            user: {
                userID: -1,
                avatar: "no-avatar",
                username: "",
                profileDesc: "",
                genres: [],
                series: []
            },
            imageInstance: null
        }
    },
    created: function() {
        this.fetch();
    },
    mounted: function() {
        this.imageInstance = M.Materialbox.init(document.getElementsByClassName("materialboxed")[0]);
    },
    beforeDestroy: function() {
        this.imageInstance.destroy();
    },
    watch: {
        "$route": function() {
            this.fetch();
        },
        "$root.user": function() {
            this.fetch();
        }
    },
    methods: {
        fetch: function() {
            var instance = this;

            axios.post("/user/profile", Qs.stringify({
                token: this.$root.user.auth,
                user_id: this.$route.params.userID
            }))
            .then(function(response) {
                instance.user = response.data;
            })
            .catch(function(error) {
                console.log(error);
            });
        }
    }
};


const LOCALIZATION = [
    {
        id: 1,
        code: "en",
        name: "English",
        strings: {
            menu_home: "Home",
            menu_series: "Series",
            menu_characters: "Characters",
            menu_users: "Users",
            episodes: "Episodes",
            episode: "Episode",
            login: "Login",
            do_login: "Log in",
            login_username: "Username",
            login_password: "Password",
            register: "Register",
            user_list_watching: "Watching",
            user_list_finished: "Finished",
            user_list_planned: "Planned",
            user_list_on_hold: "On Hold",
            user_list_dropped: "Dropped",
            user_list_state: "State",
            summary: "Summary",
            expand: "Expand",
            collapse: "Collapse",
            info: "Information",
            genres: "Genres",
            genre: "Genre",
            year: "Year",
            stats: "Statistics",
            rating: "Rating",
            relations: "Relations",
            relation_prequel: "Prequel",
            relation_sequel: "Sequel",
            relation_alternative: "Alternative",
            relation_other: "Other",
            add_series: "Add",
            edit_series: "Edit",
            birthday: "Birthday",
            link: "Link",
            language: "Language",
            list: "List",
            cancel: "Cancel",
            translate: "Translate",
            translate_edit: "Translate/Edit",
            any: "Any",
            delete: "Delete",
            episode_number: "Number",
            add: "Add",
            character_id: "Character ID",
            series_id: "Series ID",
            image_link: "Image Link",
            language_modal: "Remember to add strings in the object's default language!"
        }
    },
    {
        id: 2,
        code: "de",
        name: "Deutsch",
        strings: {
            menu_home: "Home",
            menu_series: "Serien",
            menu_characters: "Charaktere",
            menu_users: "Nutzer",
            episodes: "Episoden",
            episode: "Episode",
            login: "Anmeldung",
            do_login: "Anmelden",
            login_username: "Benutzername",
            login_password: "Passwort",
            register: "Registrieren",
            user_list_watching: "Schaue ich",
            user_list_finished: "Fertig",
            user_list_planned: "Geplant",
            user_list_on_hold: "Pausiert",
            user_list_dropped: "Abgebrochen",
            user_list_state: "Status",
            summary: "Zusammenfassung",
            expand: "Ausklappen",
            collapse: "Einklappen",
            info: "Information",
            genres: "Genres",
            genre: "Genre",
            year: "Jahr",
            stats: "Statistiken",
            rating: "Bewertung",
            relations: "Beziehungen",
            relation_prequel: "Vorherige",
            relation_sequel: "Fortsetzung",
            relation_alternative: "Alternative",
            relation_other: "Anderes",
            add_series: "Hinzufügen",
            edit_series: "Bearbeiten",
            birthday: "Geburtstag",
            link: "Link",
            language: "Sprache",
            list: "Liste",
            cancel: "Abbrechen",
            translate: "Übersetzen",
            translate_edit: "Übersetzen/Bearbeiten",
            any: "Beliebig",
            delete: "Löschen",
            episode_number: "Nummer",
            add: "Hinzufügen",
            character_id: "Charakter-ID",
            series_id: "Serien-ID",
            image_link: "Bildlink",
            language_modal: "Denk daran auch Texte für die Standardsparche des Objektes einzufügen!"
        }
    }
]