import { Injectable } from '@angular/core';
import { Firestore,  collection, query, where, getDocs,  doc, setDoc, deleteDoc, updateDoc, collectionData } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Student } from '../model/Student';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  private firestore: Firestore = inject(Firestore); // Inject Firestore service
  
  // Utility to check if the code is running in the browser
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.navigator !== 'undefined';
  }

  addStudent(student: Student) {
    if (this.isBrowser() && navigator.onLine) {
   
      const studentsCollection = collection(this.firestore, 'Students');
      const studentRef = doc(studentsCollection);
      student.id = studentRef.id;
      return setDoc(studentRef, student); 
    } else {
      let offlineStudents = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
      offlineStudents.push(student);
      localStorage.setItem('offlineStudents', JSON.stringify(offlineStudents));
      return Promise.resolve();
    }
  }

  getAllStudents(): Observable<Student[]> {
    const studentsCollection = collection(this.firestore, 'Students');

    return collectionData(studentsCollection, { idField: 'id' }) as Observable<Student[]>;
  }

  deleteStudent(student: Student) {
    if (this.isBrowser() && navigator.onLine) {
      const studentDoc = doc(this.firestore, 'Students', student.id);
      return deleteDoc(studentDoc);
    } else {
      let offlineStudents = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
      offlineStudents = offlineStudents.filter((s: Student) => s.id !== student.id);
      localStorage.setItem('offlineStudents', JSON.stringify(offlineStudents));
      return Promise.resolve();
    }
  }

  async getIdFromFireBase(student: Student) {
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
  updateStudent(student: Student) {
    if (this.isBrowser() && navigator.onLine) {
      const studentDoc = doc(this.firestore, 'Students', student.id);
      return updateDoc(studentDoc, { ...student });
    } else {
      let offlineStudents = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
      const index = offlineStudents.findIndex((s: Student) => s.id === student.id);
      if (index !== -1) {
        offlineStudents[index] = student;
        localStorage.setItem('offlineStudents', JSON.stringify(offlineStudents));
      }
      return Promise.resolve();
    }
  }

  syncOfflineStudents() {
    if (this.isBrowser() && navigator.onLine) {
      const offlineStudents = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
      if (offlineStudents.length > 0) {
        offlineStudents.forEach((student: Student) => {
          this.addStudent(student).then(() => {
            this.removeOfflineStudent(student);
          });
        });
      }
    }
  }

  removeOfflineStudent(student: Student) {
    let offlineStudents = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
    offlineStudents = offlineStudents.filter((s: Student) => s.id !== student.id);
    localStorage.setItem('offlineStudents', JSON.stringify(offlineStudents));
  }
}
