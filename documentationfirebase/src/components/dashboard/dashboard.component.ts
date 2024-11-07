import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Student } from '../../model/Student';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
@Component({
  selector: 'app-dashboard',
  standalone:true ,
  imports : [FormsModule,RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent  implements OnInit  {
  ngOnInit(): void {
   
  }
   studentsList: Student[] = [];
  studentObj: Student = {
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
  };
  id: string = '';
  first_Name: string = '';
  last_Name: string = '';
  mobile: string = '';
  email: string = '';

  constructor(private auth: AuthService, private data: DataService) {}
  


  getAllStudents() {
    this.data.getAllStudents().subscribe(
      (res) => {
        this.studentsList = res.map((e: any) => {
          const data = e.payload.doc.data();
          data.id = e.payload.doc.id;
          return data;
        });
      },
      (err) => {
        alert('error while fetching data ' + err.message);
      }
    );
  }

  addStudent() {
   
    (this.studentObj.id = ''), (this.studentObj.first_name = this.first_Name);
    this.studentObj.last_name = this.last_Name;
    this.studentObj.mobile = this.mobile;
    this.studentObj.email = this.email;

    this.data.addStudent(this.studentObj);
    console.log("FirstName:" + this.first_Name);
    this.resetForm();
  }
  
    updateStudent(student: Student) {
      this.data.addStudent(student);
    }

  resetForm() {
    this.first_Name == '' ;
      this.last_Name == '' ;
      this.mobile == '' ;
      this.email == '';
  }
  deleteStudent(student: Student) {
    if (
      window.confirm(
        'are you sure u wanna delete ' +
          student.first_name +
          ' ' +
          student.last_name
      )
    ) {
      this.data.deleteStudent(student);
    }
  }
 
}