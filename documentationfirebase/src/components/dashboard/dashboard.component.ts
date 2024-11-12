import { Component, OnInit } from '@angular/core';
import { Student } from '../../model/Student';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  studentsList: Student[] = [];
  fullLost: boolean = true;
  studentObj: Student = {
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile: '',
  };
  OldstudentObj: Student = {
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

  // 0 -> there is internet
  // 1 -> there is absolutly no internet
  // 2 -> internet lost on the middle

  //delete from localStorage normal  0
  //delete freom  (search if exdists )1
  //delete freom  database 2

  way() {
    return 1;
  }

  ngOnInit(): void {
    this.getAllStudents();
    this.data.syncOfflineStudents(); // Sync offline data when the app is online
    this.data.syncOfflineStudentsDel();
    this.data.syncOfflineStudentsUpdate();
  }

  logOut() {
    this.auth.logout();
  }

  // Get all students and display them in the UI
  getAllStudents(): void {


    
    this.data.getAllStudents().subscribe(
      (students) => {
        this.studentsList = students;

        if (this.studentsList.length == 0) {
          this.fullLost = true;
        } else {
          this.fullLost = false;
        }
      },
      (err) => {
        alert('Error while fetching data: ' + err.message);
      }
    );
  }

  // Add a student
  addStudent() {
    this.studentObj.first_name = this.first_Name;
    this.studentObj.last_name = this.last_Name;
    this.studentObj.mobile = this.mobile;
    this.studentObj.email = this.email;

    // Check if all fields are filled
    if (
      !this.studentObj.first_name ||
      !this.studentObj.last_name ||
      !this.studentObj.email ||
      !this.studentObj.mobile
    ) {
      alert('Please fill all the fields.');
      return;
    }

    // Add student to Firestore
    if (this.studentObj != null) {
      const myvalue = this.data
        .addStudent(this.studentObj)
        .then(() => {
          console.log('Student added:', this.studentObj);
          this.resetForm(); // Reset form after adding the student
        })
        .catch((error) => {
          console.error('Error adding student:', error);
        });
      if (myvalue !== null) {
        this.studentsList.push(this.data.getNewStudent());
      }
    }
  }

  // Update a student's details
  updateStudent(Oldstudent: Student , newStudent : Student ) {
    this.data
      .updateStudent(Oldstudent  ,newStudent , this.way())
      .then(() => {
        console.log('Student updated:', newStudent);




      })
      .catch((error) => {
        console.error('Error updating student:', error);
      });
  }

  // Delete a student from list
  deleteStudent(student: Student) {
    if (
      window.confirm(
        `Are you sure you want to delete ${student.first_name} ${student.last_name}?`
      )
    ) {
      this.data
        .deleteStudent(student, this.way())
        .then(() => {
          console.log('Student deleted:', student);
          const index = this.studentsList.findIndex(
            (item) => item.id === student.id
          );
          if (index !== -1) {
            this.studentsList.splice(index, 1);
            console.log('Student removed from the list:', student);
          }
        })
        .catch((error) => {
          console.error('Error deleting student:', error);
        });
    }
  }

  // Reset the form fields
  resetForm() {
    this.first_Name = '';
    this.last_Name = '';
    this.mobile = '';
    this.email = '';
  }

  async deleteStudent2() {
    this.studentObj.first_name = this.first_Name;
    this.studentObj.last_name = this.last_Name;
    this.studentObj.mobile = this.mobile;
    this.studentObj.email = this.email;

    // Check if all fields are filled
    if (
      !this.studentObj.first_name ||
      !this.studentObj.last_name ||
      !this.studentObj.email ||
      !this.studentObj.mobile
    ) {
      alert('Please fill all the fields.');
      return;
    }

    // Add student to Firestore or localStorage
    this.data
      .deleteStudent(this.studentObj, 2)
      .then(() => {
        console.log('Student Deleted:', this.studentObj);
        this.resetForm(); // Reset form after adding the student
      })
      .catch((error) => {
        console.error('Error adding student:', error);
      });
  }

  update(student: Student) {
    this.first_Name = student.first_name;
    this.last_Name = student.last_name;
    this.email = student.email;
    this.mobile = student.mobile;
    this.id = student.id;

    this.OldstudentObj.id = this.id;
    this.OldstudentObj.first_name = this.first_Name;
    this.OldstudentObj.last_name = this.last_Name;
    this.OldstudentObj.mobile = this.mobile;
    this.OldstudentObj.email = this.email;
    


  }
  updateStudent2() {
    this.studentObj.id = this.id;
    this.studentObj.first_name = this.first_Name;
    this.studentObj.last_name = this.last_Name;
    this.studentObj.mobile = this.mobile;
    this.studentObj.email = this.email;
    this.updateStudent(this.OldstudentObj , this.studentObj );
  }
}
