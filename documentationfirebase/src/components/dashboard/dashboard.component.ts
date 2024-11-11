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
  emailDelete: string = '';
  fullLost: boolean = true;
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
  visible: boolean = true;
  constructor(private auth: AuthService, private data: DataService) {}

  async ngOnInit() {
    this.getAllStudents();
    this.data.syncOfflineStudents(); // Sync offline data when the app is online
  }

  logOut() {
    this.auth.logout();
  }

  // Get all students from Firestore
  async getAllStudents() {
    this.data.getAllStudents().subscribe(
      (students) => {
        this.studentsList = students;
        console.log(students);
        console.log('2', this.studentsList.length);

        if (this.studentsList.length == 0) {
          this.fullLost = true;
        } else {
          this.fullLost = false;
        }
        if (this.fullLost == true) {
          // Check if we're in the browser (in the client-side)
          console.log(this.studentsList);
          if (typeof window !== 'undefined') {
            alert(this.studentsList.length);
            alert('Connexion == 0%');
          }
        } else {
          if (typeof window !== 'undefined') {
            alert('Connexion more than 0%');
          }
        }
      },
      (err) => {
        alert('Error while fetching data: ' + err.message);
      }
    );
  }

  // Add a student (either locally or to Firestore)
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
    this.resetForm(); // Reset form after adding the student

    // Add student to Firestore or localStorage
    this.data
      .addStudent(this.studentObj)
      .then(() => {
        console.log('Student added:', this.studentObj);
      })
      .catch((error) => {
        console.error('Error adding student:', error);
      });
  }

  // Update a student
  updateStudent(student: Student) {
    this.data
      .updateStudent(student)
      .then(() => {
        console.log('Student updated:', student);
      })
      .catch((error) => {
        console.error('Error updating student:', error);
      });
  }

  // Delete a student
  deleteStudent(student: Student) {
    if (
      window.confirm(
        `Are you sure you want to delete ${student.first_name} ${student.last_name}?`
      )
    ) {
      this.data
        .deleteStudent(student)
        .then(() => {
          console.log('Student deleted:', student);
        })
        .catch((error) => {
          console.error('Error deleting student:', error);
        });
    }
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

    this.studentObj.id = await this.data.getIdFromFireBase(this.studentObj);

    // Add student to Firestore or localStorage
    this.data
      .deleteStudent(this.studentObj)
      .then(() => {
        console.log('Student Deleted:', this.studentObj);
        this.resetForm(); // Reset form after adding the student
      })
      .catch((error) => {
        console.error('Error adding student:', error);
      });
  }

  // Reset the form fields
  resetForm() {
    alert('form reset success ');
    this.first_Name = '';
    this.last_Name = '';
    this.mobile = '';
    this.email = '';
  }
}

/* import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Student } from '../../model/Student';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
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

  ngOnInit(): void {
    this.getAllStudents();
  }

  logOut() {
    this.auth.logout();
  }

  // Get all students and display them in the UI
  getAllStudents(): void {
    this.data.getAllStudents().subscribe(
      (students) => {
        this.studentsList = students;
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
    if (!this.studentObj.first_name || !this.studentObj.last_name || !this.studentObj.email || !this.studentObj.mobile) {
      alert('Please fill all the fields.');
      return;
    }

    // Add student to Firestore
    this.data.addStudent(this.studentObj)
      .then(() => {
        console.log('Student added:', this.studentObj);
        this.resetForm(); // Reset form after adding the student
      })
      .catch((error) => {
        console.error('Error adding student:', error);
      });
  }

  // Update a student's details
  updateStudent(student: Student) {
    this.data.updateStudent(student)
      .then(() => {
        console.log('Student updated:', student);
      })
      .catch((error) => {
        console.error('Error updating student:', error);
      });
  }

  // Delete a student
  deleteStudent(student: Student) {
    if (window.confirm(`Are you sure you want to delete ${student.first_name} ${student.last_name}?`)) {
      this.data.deleteStudent(student)
        .then(() => {
          console.log('Student deleted:', student);
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
}
 */
