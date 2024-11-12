import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  collectionData,
} from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Student } from '../model/Student';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private firestore: Firestore = inject(Firestore); // Inject Firestore service

  // Utility to check if the code is running in the browser
  private isBrowser(): boolean {
    return (
      typeof window !== 'undefined' && typeof window.navigator !== 'undefined'
    );
  }
  isOnline: boolean = false    ;

  /**************** ADD STUDENT FUNCTIONS ************* */

  addStudent(student: Student) {
    
    if (this.isOnline) {
      return this.addStudentDirectlyToFireBase(student);
    } else {
      return this.addStudentUsingLocalStorage(student);
    }
  }

  addStudentDirectlyToFireBase(student: Student): Promise<void> {
    const studentsCollection = collection(this.firestore, 'Students');
    const studentRef = doc(studentsCollection);
    student.id = studentRef.id;
    return setDoc(studentRef, student);
  }
  addStudentUsingLocalStorage(student: Student): Promise<void> {

    let offlineStudents = JSON.parse(
      localStorage.getItem('offlineStudents') || '[]'
    );
    offlineStudents.push(student);
    localStorage.setItem('offlineStudents', JSON.stringify(offlineStudents));
    return Promise.resolve();
  }
  /***************************** */

  /*******************  DELETE FUNCTIONS **************** */

  async deleteStudent(student: Student, way: number) {
    // if (this.isBrowser() && navigator.onLine) {
    if (this.isOnline) {
      this.DeleteDirectlyFromFireBase(student);
    } else {
      if (way === 0) {
        //delete a student added when offline
        this.DeleteFromLocalStorage(student);
      } else if (way === 1) {
        this.DeleteWhenInternetLostOnTheMiddle(student);
      }
    }
  }

  async DeleteDirectlyFromFireBase(student: Student) {
    if (student.id === null || student.id === undefined || student.id === '') {
      student.id = await this.getIdFromFireBase(student);
    }

    const studentDoc = doc(this.firestore, 'Students', student.id);
    return deleteDoc(studentDoc);
  }

  DeleteFromLocalStorage(student: Student) {
    let offlineStudents = JSON.parse(
      localStorage.getItem('offlineStudents') || '[]'
    );
    offlineStudents = offlineStudents.filter(
      (s: Student) =>
        s.first_name !== student.first_name &&
        s.last_name !== student.last_name &&
        s.email !== student.email &&
        s.mobile !== student.mobile
    );
    localStorage.setItem('offlineStudents', JSON.stringify(offlineStudents));
    return Promise.resolve();
  }
  DeleteFromFireBaseUsingLocalStorage(student: Student) {
    let offlineStudentsDelete = JSON.parse(
      localStorage.getItem('offlineStudentsDelete') || '[]'
    );
    offlineStudentsDelete.push(student);
    localStorage.setItem(
      'offlineStudentsDelete',
      JSON.stringify(offlineStudentsDelete)
    );
    return Promise.resolve();
  }

  DeleteWhenInternetLostOnTheMiddle(student: Student) {
    if (this.studentExistsInLocalStorage(student)) {
      return this.DeleteFromLocalStorage(student);
    } else {
      return this.DeleteFromFireBaseUsingLocalStorage(student);
    }
  }

  /**************** END DELETE FUNCTIONS ****************** */

  /****************  UPDATE  FUNCTIONS ****************** */

  async updateStudent(oldstudent: Student , newStudent: Student, way: number) {
    // if (this.isBrowser() && navigator.onLine) {
    console.log(way + "?");
    if (this.isOnline) {
      this.updateDirectlyFromFireBase(oldstudent , newStudent);
    } else {
     /*  if (way === 0) {
        //delete a student added when offline
        this.updateStudentInLocalStorage(student);
      } else if (way === 1) {
        //delete from firebase using the local storage */

        this.UpdateWhenInternetLostOnTheMiddle(oldstudent , newStudent);
      //}
    }
  }

  updateStudentInLocalStorage(oldStudent: Student, updatedStudent: Student): Promise<void> {
    console.log("Correct update");

    // Get the current list of offline students from localStorage
    let offlineStudents = JSON.parse(localStorage.getItem('offlineStudents') || '[]');

    // Find the student to update and modify the properties
    offlineStudents = offlineStudents.map((s: Student) => {
        if (
            s.first_name === oldStudent.first_name &&
            s.last_name === oldStudent.last_name &&
            s.email === oldStudent.email &&
            s.mobile === oldStudent.mobile
        ) {
            // Update the student with the new data
            return { ...s, ...updatedStudent }; // Merge the updated properties with the existing ones
        }
        return s; // If no match, return the student as is
    });

    // Save the updated list back to localStorage under the correct key
    localStorage.setItem('offlineStudents', JSON.stringify(offlineStudents));

    return Promise.resolve();
}


  UpdateInFireBaseUsingLocalStorage(student: Student) {
    console.log("Entrada al metode");
    let offlineStudentsDelete = JSON.parse(
      localStorage.getItem('offlineStudentsUpdate') || '[]'
    );
    offlineStudentsDelete.push(student);


    this.CrearLocalStorage('offlineStudentsUpdate',
       JSON.stringify(offlineStudentsDelete));
    return Promise.resolve();
  }


  updateDirectlyFromFireBase(student: Student , newStudent:Student) {
    const studentDoc = doc(this.firestore, 'Students', student.id);
    return updateDoc(studentDoc, { ...student });
  }

  UpdateWhenInternetLostOnTheMiddle(student: Student , newStudent: Student) {
    console.log("within");
    console.log("student updated " + student.first_name)
    if (this.studentExistsInLocalStorage(student)) {
      console.log("exist")
      return this.updateStudentInLocalStorage(student ,  newStudent);
    } else {
      console.log("no exist");
      return this.UpdateInFireBaseUsingLocalStorage(student);
    }
  }

  /**************** END UPDATE FUNCTIONS ****************** */

  /**************** GENERAL FUNCTIONS ****************** */
  studentExistsInLocalStorage(student: Student): boolean {
    const storedData: Student[] | null = JSON.parse(
      localStorage.getItem('offlineStudents') || '[]'
    );
    if (Array.isArray(storedData)) {
      // Check if any student in the stored data matches the provided student
      return storedData.some(
        (storedStudent) =>
          storedStudent.first_name === student.first_name &&
          storedStudent.last_name === student.last_name &&
          storedStudent.email === student.email
      );
    }
    return false; // No students in localStorage or stored data is not an array
  }

  async getIdFromFireBase(student: Student): Promise<string> {
    try {
      const studentsCollection = collection(this.firestore, 'Students');

      // Create a query to search for the student by first_name, last_name, and other fields (you can add more fields here)
      const q = query(
        studentsCollection,
        where('first_name', '==', student.first_name),
        where('last_name', '==', student.last_name),
        where('email', '==', student.email),
        where('mobile', '==', student.mobile) // Add more fields if necessary
      );

      // Execute the query
      const querySnapshot = await getDocs(q);

      // If the query returns a document, return its ID
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]; // Take the first match (you could also handle multiple matches)
        return doc.id;
      } else {
        console.log('No matching student found.');
        return 'null'; // Or return some default value indicating no match
      }
    } catch (error) {
      console.error('Error fetching student ID:', error);
      return 'null'; // Return 'null' in case of an error
    }
  }
  /**************************************** */

  /************** FUNCTIONS USED WITHING TS ****************** */
  getNewStudent() {
    let offlineStudents = JSON.parse(
      localStorage.getItem('offlineStudents') || '[]'
    );
    return offlineStudents[offlineStudents.length - 1];
  }

  getAllStudents(): Observable<Student[]> {
    const studentsCollection = collection(this.firestore, 'Students');

    return collectionData(studentsCollection, { idField: 'id' }) as Observable<
      Student[]
    >;
  }

  deleteStudentForm(student: Student) {
    if (this.isOnline) {
      alert('You can just delete it from the list broo , come ooon ');
      return;
    } else {
      let offlineStudentsDelete = JSON.parse(
        localStorage.getItem('offlineStudentsDelete') || '[]'
      );
      offlineStudentsDelete.push(student);
      localStorage.setItem(
        'offlineStudentsDelete',
        JSON.stringify(offlineStudentsDelete)
      );
      return Promise.resolve();
    }
  }
  
  ///////////*** RESET LOCAL STORAGE ***///////////////////
  /********** push changes to the database  */
  syncOfflineStudents() {
    if (this.isBrowser() && navigator.onLine) {
      const offlineStudents = JSON.parse(
        localStorage.getItem('offlineStudents') || '[]'
      );
      if (offlineStudents.length > 0) {
        offlineStudents.forEach((student: Student) => {
          this.addStudent(student).then(() => {
            this.removeOfflineStudent(student);
          });
        });
      }
    }
  }

  syncOfflineStudentsDel() {
    if (this.isBrowser() && navigator.onLine) {
      const offlineStudentsDelete = JSON.parse(
        localStorage.getItem('offlineStudentsDelete') || '[]'
      );
      if (offlineStudentsDelete.length > 0) {
        offlineStudentsDelete.forEach((student: Student) => {
          this.deleteStudent(student, 0).then(() => {
            this.removeOfflineStudentDel(student);
            console.log("removed del ");
          });
        });
      }
    }
  }
  
  syncOfflineStudentsUpdate() {
    if (this.isBrowser() && navigator.onLine) {
      const offlineStudentsDelete = JSON.parse(
        localStorage.getItem('offlineStudentsUpdate') || '[]'
      );
      console.log("fora" + offlineStudentsDelete.length);
      if (offlineStudentsDelete.length > 0) {
        offlineStudentsDelete.forEach((student: Student) => {
          console.log("adins");
          this.updateStudent(student , student, 0).then(() => {
            this.removeOfflineStudentUpdate(student);
          });
        });
      }
    }
  }

  /**
   * Methot that creates an localStorage.
   * @param name Name of the Id to the localStorage 
   * @param value Value to localstorage
   */
  CrearLocalStorage(name : string, value: any){
    localStorage.setItem(name, value);
  }
  /********** void the local storage variables */
  /**
   * 
   * @param student 
   */
  removeOfflineStudent(student: Student) {
    let offlineStudents = JSON.parse(
      localStorage.getItem('offlineStudents') || '[]'
    );
    offlineStudents = offlineStudents.filter(
      (s: Student) =>
        s.first_name !== student.first_name &&
        s.last_name !== student.last_name &&
        s.email !== student.email &&
        s.mobile !== student.mobile
    );
    localStorage.setItem('offlineStudents', JSON.stringify(offlineStudents));
  }
  removeOfflineStudentDel(student: Student) {
    let offlineStudentsDelete = JSON.parse(
      localStorage.getItem('offlineStudentsDelete') || '[]'
    );
    offlineStudentsDelete = offlineStudentsDelete.filter(
      (s: Student) =>
        s.first_name !== student.first_name &&
        s.last_name !== student.last_name &&
        s.email !== student.email &&
        s.mobile !== student.mobile
    );
    localStorage.setItem(
      'offlineStudentsDelete',
      JSON.stringify(offlineStudentsDelete)
    );
  }
  removeOfflineStudentUpdate(student: Student) {
    let offlineStudentsDelete = JSON.parse(
      localStorage.getItem('offlineStudentsUpdate') || '[]'
    );
    offlineStudentsDelete = offlineStudentsDelete.filter(
      (s: Student) =>
        s.first_name !== student.first_name &&
        s.last_name !== student.last_name &&
        s.email !== student.email &&
        s.mobile !== student.mobile
    );
    localStorage.setItem(
      'offlineStudentsUpdate',
      JSON.stringify(offlineStudentsDelete)
    );
  }
  

  ///////////////////////////////////////////////////////////////////////
}
