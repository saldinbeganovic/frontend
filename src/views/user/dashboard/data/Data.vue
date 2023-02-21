<template>
    <mo-dashboard-body>
      <template #body>
        
        <b-col>
          <b-row>
            
       <div class="buttons">



        <div class="wraperButtons">
       <h5>PERIOD</h5>
       <div class="d-flex flex-row">
        <div id="firstDate">
          <b-form-datepicker v-if="selectedRadio=='A' || selectedRadio=='B' " disabled="disabled"
      id="datepicker-dateformat1"
      class="datepicker"
      :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
      v-model="date1"
      locale="da"
    ></b-form-datepicker>
        <b-form-datepicker v-else
      id="datepicker-dateformat1"
      :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
      v-model="date1"
      class="datepicker"
      locale="da"
    ></b-form-datepicker> 
  </div>
  <div id="arrow">
    ⇄
  </div>
    <div>
      <b-form-datepicker v-if="selectedRadio=='A' || selectedRadio=='B' "
      id="datepicker-dateformat2"
      disabled="disabled"
      class="datepicker"
      :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
      v-model="date2"
      locale="da"
    ></b-form-datepicker>  
    <b-form-datepicker
      id="datepicker-dateformat2"
      v-else
      class="datepicker"
      :date-format-options="{ year: 'numeric', month: 'numeric', day: 'numeric' }"
      v-model="date2"
      locale="da"
    ></b-form-datepicker> 
  </div>
  
  </div>
 
</div>

<div class="radioButtons">
  <b-form-checkbox-group
      v-model="selectedRadio"
      :options="options"
      class="mb-3"
      value-field="item"
      text-field="name"
      disabled-field="notEnabled"
      @change="handleChange($event)"
    ></b-form-checkbox-group>
    
  </div>
 
       </div>
       <div class="radioButtons2">
  <b-form-radio-group 
      v-model="selectedTable"
      :options="optionsTable"
      class="mb-3"
      value-field="item"
      text-field="name"
      disabled-field="notEnabled"
      @change="handleChange($event)"
    ></b-form-radio-group>
   
</div>
      </b-row>
      <b-row>
          <div id="overALL"><h6 id="overHeader">OVERALL</h6> 
            <h3 id="overData">
            <span >{{ formatBytes(tweened.toFixed(0))}} </span> 
           <span style="opacity: 0; position:absolute; z-index: -123;">{{ formatBytes(sumData) }}</span>
            </h3>
            
            
          
          </div>

            
            
          

        </b-row>
      
        <b-row class="mo-table" v-if="selectedTable=='pos' || selectedTable=='all'"  >
          
          <h5>POS</h5>
          <mo-table
            table-class="mo-users-table w-100 h-100 mo-table__multiple table"
            empty-text="No data for selected period"
            :search-query="searchQuery"
            :items="uniquePOS"
            :fields="fields"
            :loading="isLoading"
            :fixed="true"
            @select="selected = $event"
            @edit="onEdit"
            sticky-header
            show-empty
            striped
            hover
            ref="tablePos"

          >
          <template v-slot:cell(precentage)="{ item }">
           <div id="allPr" :class="{ 'softgreen': (item.data/item.maxData)*100 >= '0', 'green': (item.data/item.maxData)*100 > '20' , 'yellow': (item.data/item.maxData)*100 > '40', 'orange': (item.data/item.maxData)*100 > '60', 'red': (item.data/item.maxData)*100 > '90'}">
            {{ ((item.data/item.maxData)*100).toFixed(0)}}%
            </div>
          </template>
          <template v-slot:cell(fdate)="{ item }">
          
          <span >
        {{ formatDateView(item.fdate) }} 
          </span>
        </template>
        <template v-slot:cell(tdate)="{ item }">
          
          <span >
        {{ formatDateView(item.tdate) }} 
          </span>
        </template>
          <template v-slot:cell(data)="{ item }">
          
            <span >
          {{ formatBytes(item.data) }} / {{formatBytes(item.maxData)}}
            </span>
          </template>
          
          
        </mo-table>
     
        </b-row>
        <b-row class="mo-table" v-if="selectedTable=='group' || selectedTable=='all'">
        
          <h5>GROUP</h5>
          <mo-table
            table-class="mo-users-table w-100 h-100 mo-table__multiple table"
            empty-text="No data for selected period"
            :search-query="searchQuery"
            :items="uniqueGroup"
            :fields="fields2"
            :loading="isLoading"
            foot-clone
            :fixed="true"
            @select="selected = $event"
            @edit="onEdit"
            sticky-header
            show-empty
            striped
            hover
          >
          <template v-slot:cell(precentage)="{ item }">
           <div id="allPr" :class="{ 'softgreen': (item.data/item.maxData)*100 >= '0', 'green': (item.data/item.maxData)*100 > '20' , 'yellow': (item.data/item.maxData)*100 > '40', 'orange': (item.data/item.maxData)*100 > '60', 'red': (item.data/item.maxData)*100 > '90'}">
            {{ ((item.data/item.maxData)*100).toFixed(0)}}%
            </div>
          </template>
          <template v-slot:cell(fdate)="{ item }">
          
          <span >
        {{ formatDateView(item.fdate) }} 
          </span>
        </template>
        <template v-slot:cell(tdate)="{ item }">
          
          <span >
        {{ formatDateView(item.tdate) }} 
          </span>
        </template>
          <template v-slot:cell(data)="{ item }">
          
            <span >
          {{ formatBytes(item.data) }} / {{formatBytes(item.maxData)}}
            </span>
          </template>
         
          
        </mo-table>
        
        </b-row>
       
      </b-col>
      </template>
    </mo-dashboard-body>
  </template>
  
  <script>
import { getCompanies } from "@/api/admin/company/company";
import { getVideoSchedules } from "@/api/admin/company/company";
import gsap from 'gsap';
 
  
  export default {
    name: "Data",
    components: {  },
    props: {
      searchQuery: {
        type: String,
        required: true
      }
    },
    
    data() {
      return {
        maxmb:1073741824,
        array:[],
        previous: null,
        tweened: 0,
        number: 0,
        isnan:true,
        date2:null,
        date1:null,
        firstDayMonth:null,
        lastDayMonth:null,
        firstDayYear:null,
        lastDayYear:null,
        isLoading: false,
        selectedRadio: '',
        options: [
          { item: 'A', name: 'CURRENT MONTH' },
          { item: 'B', name: 'CURRENT YEAR'  },
          
        ],
        selectedTable: 'all',
        optionsTable: [
          { item: 'pos', name: 'SHOW POS' },
          { item: 'group', name: 'SHOW GROUP'  },
          { item: 'all', name: 'SHOW ALL'  },
          
        ],
      selected: [],
      items: [
   
],
    companies:[
   
    
    ],
      fields: [
      {
          key: "id",
          label: "ID",
          
        },
        {
          key: "name",
          label: "POS",
          
        },
        
        { key: "fdate", label: "FROM" },
        { key: "tdate", label: "TO" },
        { key: "data", label: "DATA USED" },
        
        { key: "precentage", label: "%" }
      ],
      fields2: [
      {
          key: "id",
          label: "ID",
          
        },
      
        {
          key: "name",
          label: "GROUP",
          
        },
        
        { key: "fdate", label: "FROM" },
        { key: "tdate", label: "TO" },
        { key: "data", label: "DATA USED" },

        { key: "precentage", label: "%" }
      ]
      };
    },
    watch:{ 
      number(n) {
      gsap.to(this, { duration: 1.5, tweened: Number(n) || 0 })
    }
    },
    computed: {
      uniqueGroup: function() {
        var new_object = [];
        var group_id=0;
        var group_name="";
        var maxData=0;
        var data=0;
        var dates='';
        var array=[];
        var maxDate=null;
      var minDate=null; 

        for(var i =0; i < this.items.length; i++) {
          
          //compare player.unit.company_id with this.companies.id 
          if(this.items[i].player.unit.point_of_sale.company_id == this.companies[i].id) {
            group_id=this.companies[i].id;
            group_name=this.companies[i].name;
           
          
           break;
          }
        }
        for(var y =0; y < this.uniquePOS.length; y++) {
          
          maxData=maxData+this.uniquePOS[y].maxData;
          data = data+this.uniquePOS[y].data;
          dates=this.formatDate(this.uniquePOS[y].fdate)+","+this.formatDate(this.uniquePOS[y].tdate)+","+dates;
          
         
        }
        array=dates.split(',');
        const removeLast = array.pop();
        console.log(removeLast);
              maxDate = new Date(
            Math.max(
              ...array.map(element => {
                return new Date(element);
              }),
            ),
          );

           minDate = new Date(
            Math.min(
              ...array.map(element => {
                return new Date(element);
              }),
            ),
          );
          
        
      
       
          
        
       
        if(!isNaN(maxDate))   {
          new_object.push({id:group_id,name:group_name,maxData:maxData,data:data,fdate:minDate ,tdate:maxDate});
        
          
        }
       
        
        
        return new_object;                   
      
      },
      uniquePOS: function() {
        //TEMPORARY SOLUTION
      var filtered_name = [];
      var filtered_id = [];
      var new_object=[];
      var numberOfNames =0;
      var data = 0;
      var maxDate=null;
      var minDate=null; 
      var result=[]; 
      var array = [];
      var filteredItems = [];
      var posLenght=0;
     
      

      if(this.selectedRadio=='A'){ 
        filteredItems = this.items.filter(d => {var time = this.formatDate(d.scheduled_at);
                             return (this.formatDate(this.firstDayMonth) < time && time < this.formatDate(this.lastDayMonth));
                            });
                           
      }else if(this.selectedRadio=='B'){ 
        filteredItems = this.items.filter(d => {var time = d.scheduled_at;
                             return (this.formatDate(this.firstDayYear) < time && time < this.formatDate(this.lastDayYear));
                            });              
      }else{
        if(this.date1!= null && this.date2!=null){
          filteredItems = this.items.filter(d => {var time = d.scheduled_at;
                             return (this.formatDate(this.date1) < time && time < this.formatDate(this.date2));
                            });
        }else{
        filteredItems = this.items.filter(d => {
                             return (d.id>0);
                            });
                          }
                           
      }


   

      result = [...filteredItems.reduce( (mp, o) => {
    if (!mp.has(o.player.unit.point_of_sale.name)) mp.set(o.player.unit.point_of_sale.name, { ...o, count: 0, data:0, dates:[] });{
      mp.get(o.player.unit.point_of_sale.name).count++;
    
      if(o.video.size==null){
        o.video.size=0;
      }
      mp.get(o.player.unit.point_of_sale.name).data=parseInt(mp.get(o.player.unit.point_of_sale.name).data) + parseInt(o.video.size);
      mp.get(o.player.unit.point_of_sale.name).dates=o.scheduled_at+ ","+mp.get(o.player.unit.point_of_sale.name).dates ;
      
    }
    
    return mp;
    }, new Map).values()];

   
  
      for(var i =0; i < filteredItems.length; i++) {
        
        if(filteredItems[i].player.unit.point_of_sale.name != null){
        if(filtered_name.indexOf(filteredItems[i].player.unit.point_of_sale.name) === -1) {
          
          filtered_name.push(filteredItems[i].player.unit.point_of_sale.name);
          filtered_id.push(filteredItems[i].player.unit.point_of_sale.id);
          
          for(var y =0; y < filtered_name.length; y++){
            
           
            if(filtered_name[y]==result[y].player.unit.point_of_sale.name){
              numberOfNames= this.maxmb;
              data=result[y].data;
              array=result[y].dates.split(',');
              
              const removeLast = array.pop();
              console.log(removeLast);
              maxDate = new Date(
            Math.max(
              ...array.map(element => {
                return new Date(element);
              }),
            ),
          );

           minDate = new Date(
            Math.min(
              ...array.map(element => {
                return new Date(element);
              }),
            ),
          );
          if(this.monthDiff(minDate,maxDate)!=0){

          
          numberOfNames=(this.monthDiff(minDate,maxDate)+1)*numberOfNames;
          
        }

            }
            posLenght=filtered_name.length;
          new_object[y]={id:filtered_id[y],name:filtered_name[y],maxData:numberOfNames,data:data,fdate:minDate ,tdate:maxDate, lenght:posLenght};
         
          }
           
           
          
        }}
       
      }
      return new_object;
    },

    sumData: function() {
  return this.uniquePOS.reduce((mp, o) => {
  
    this.number=mp + parseInt(o.data);
    return mp + parseInt(o.data);
   
    
  
  }, 0);
},
  },
    mounted() {
      var now = new Date();
      var currentYear = new Date().getFullYear();

      this.firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      this.lastDayMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      this.firstDayMonth=this.formatDate(this.firstDayMonth);
      this.lastDayMonth=this.formatDate(this.lastDayMonth);

      
      this.firstDayYear = new Date(currentYear, 0, 1);
      this.firstDayYear=this.formatDate(this.firstDayYear);
      this.lastDayYear = new Date(currentYear, 11, 31);
      this.lastDayYear=this.formatDate(this.lastDayYear);
      
     this.fetchData();
 
    },
    methods: {
      fetchData(){
        this.handleFetch(
        getVideoSchedules(this.$store.getters.companyId, {
          is_processed: 1
        })
      ).then(data => {
        this.items = data;
   
      });
        this.handleFetch(getCompanies()).then(data => {
        this.companies = data;
      
      });
      
      
      
      },
     monthDiff(dateFrom, dateTo) {
 return dateTo.getMonth() - dateFrom.getMonth() + 
   (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
},
      formatDate(date)  {
            var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

           if (month.length < 2) 
             month = '0' + month;
            if (day.length < 2) 
            day = '0' + day;

        return [year, month, day].join('-');
        },
        formatDateView(date)  {
            var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

           if (month.length < 2) 
             month = '0' + month;
            if (day.length < 2) 
            day = '0' + day;

        return [day, month, year].join('.');
        },
     
      handleChange: function(e) {
       

        const name = e;
        this.selectedRadio = name;
       
        if(name=='A'){
       
          this.date1=this.firstDayMonth;
          this.date2=this.lastDayMonth;
          this.$refs.tablePos.refresh();
        }else if(name=='B'){
         
          this.date1=this.firstDayYear;
          this.date2=this.lastDayYear;
          this.$refs.tablePos.refresh();
        }else{
          this.date1=null;
          this.date2=null;
          this.$refs.tablePos.refresh();
        }
    }
    }
  };
  </script>
  <style >
  #overALL{
    text-align: center;
    border: solid 1px rgb(100, 100, 100);
    width:100%;
    margin-bottom:50px;
  }
  #overHeader{
    background-color:black;
    color: white;
    padding: 8px;
    
  }
  #overData{ 
    padding:12px;
  }
  #firstDate{ 
    padding-right:10px;
  }
  .buttons{ 
    padding-bottom:60px;
  }
  .wraperButtons{ 
    
    padding-right: 20px;
  }
  .radioButtons{ 
    padding-top:15px;
    font-size:18px;
    vertical-align: middle !important;
  }
  .radioButtons2{ 
    padding-top:15px;
    font-size:18px;
    vertical-align: middle !important;
    position:absolute;
    right:20px;
  }

.custom-control-label {
    position: relative;
    margin-bottom: 0;
    vertical-align: top;
    padding-top: 5px;
}
.datepicker{
  width: 260px !important;
}
  #arrow{
    vertical-align:center;
    text-align: center;
    padding-top:5px;
    padding-right:10px;
    font-size:25px;
    color:rgb(134, 134, 134);
  }
  .cstmBtn{ 
    margin-top:35px;
  }
  .softgreen    {
    background: #8CD47E; 
  
    border-radius: 4px;
  color:white;}
    .green   {background: #7ABD7E;
    
    border-radius: 4px;
  color:white;}
    .yellow   {background: #F8D66D;
    
    border-radius: 4px;
  color:white;}
    .orange   {background: #FFB54C;
    border-radius: 4px;
  color:white;}
    .red   {background: #FF6961;
   
    border-radius: 4px;
  color:white;}
   #allPr{ 
    line-height: 1.5;
    
    width:80px;
    
    border-radius: 4px;
    text-align:center;
   }
   .table{
  max-height: 60vh !important;
  overflow-y:scroll;
}
  .name{ 
    width: 700px;
  }
  .fdate {
    width: 190px !important;
    
  }
  .tdate {
    width: 190px !important;
  }
  .data{ 
    width: 400px;
  }
  .precentage{ 
    max-width: 100px;
    width: 100px;

  }
  </style>
  
