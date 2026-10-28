const localPhotos = require('../../utils/local-photos');
Component({properties:{records:{type:Array,value:[]}},data:{shown:[]},observers:{records(value){ this.setData({shown: localPhotos.apply(value || []) }); }},
  methods:{open(e){this.triggerEvent('open',{id:e.currentTarget.dataset.id});}}});
