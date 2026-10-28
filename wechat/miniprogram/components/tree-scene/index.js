const localPhotos = require('../../utils/local-photos');
Component({properties:{records:{type:Array,value:[]}},observers:{records(value){this.setData({nodes: localPhotos.apply((value || []).slice(0,24)) });}},data:{nodes:[]},methods:{open(e){this.triggerEvent('open',{id:e.currentTarget.dataset.id});}}});
