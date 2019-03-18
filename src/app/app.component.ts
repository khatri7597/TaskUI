import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'weatherUI';
  baseUrl = 'http://localhost:8080/forecast/';

  private submitted: boolean = false;

  private tableFlag: boolean = false;
  private weatherContent : any = [];
  private dataSavesuccess : boolean = false;
  private disableSaveButton : boolean = false; 
  private disableExportButton : boolean = false; 

  constructor(private httpClient: HttpClient){}

  myForm = new FormGroup({
    cityName: new FormControl('',Validators.required),
    startDate: new FormControl(new Date()),
    endDate: new FormControl(new Date()),
  });

  get f() { return this.myForm.controls; }

  onSubmit(){
    this.submitted = true;
    
    // stop here if form is invalid
    if (this.myForm.invalid) {
        return;
    }
    
    this.httpClient.get(this.baseUrl+this.myForm.controls.cityName['value']).subscribe((res : any[])=>{
      if(res !== undefined && res !== null){
        this.tableFlag = true;
        this.weatherContent = res;
        this.disableSaveButton = false;
        this.disableExportButton = false;
      }
    });
  }

  saveData(){
    if(this.tableFlag && this.weatherContent.length>0 ){
      let httpHeaders = new HttpHeaders().set('responseType', 'text');
      let options = {
        headers: httpHeaders
      }; 
      this.httpClient.post(this.baseUrl, this.weatherContent, {responseType: 'text'}).subscribe((response : any)=>{
          console.log(JSON.stringify(response));
          this.dataSavesuccess = true;
          this.disableSaveButton = true;
          setTimeout(() => { this.dataSavesuccess = false; }, 4000);
        }
      );
    }
  }

  downloadWeatherPdf(){
    let headers = new HttpHeaders();
    headers = headers.set('Accept', 'application/pdf');
    console.log("in download method");
    this.httpClient.get(this.baseUrl+"pdf", { headers: headers, responseType: 'blob' })
    .subscribe(x => {
        var blob = new Blob([x], {type: 'application/pdf'});
        const data = window.URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = data;
        link.download = "WeatherHistory.pdf";
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        setTimeout(function () {
            window.URL.revokeObjectURL(data);
        }, 100);
        this.disableExportButton = true;
    });
  }

}
