import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, deleteDoc, updateDoc, collectionData } from '@angular/fire/firestore';
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
