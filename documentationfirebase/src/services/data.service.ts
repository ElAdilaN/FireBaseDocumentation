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

  // Add a student (either to Firestore or localStorage if offline)
  addStudent(student: Student) {
    if (navigator.onLine) {
      // If online, send the student data to Firestore
      const studentsCollection = collection(this.firestore, 'Students');
      const studentRef = doc(studentsCollection);
      student.id = studentRef.id;
      return setDoc(studentRef, student);
    } else {
      // If offline, save the student data to localStorage
      let offlineStudents = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
      offlineStudents.push(student);
      localStorage.setItem('offlineStudents', JSON.stringify(offlineStudents));
      return Promise.resolve();  // Resolve immediately since we're offline
    }
  }

  // Get all students from Firestore
  getAllStudents(): Observable<Student[]> {
    const studentsCollection = collection(this.firestore, 'Students');
    return collectionData(studentsCollection, { idField: 'id' }) as Observable<Student[]>;
  }

  // Delete a student
  deleteStudent(student: Student) {
    if (navigator.onLine) {
      // If online, delete the student from Firestore
      const studentDoc = doc(this.firestore, 'Students', student.id);
      return deleteDoc(studentDoc);
    } else {
      // If offline, delete the student from localStorage
      let offlineStudents = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
      offlineStudents = offlineStudents.filter((s: Student) => s.id !== student.id);
      localStorage.setItem('offlineStudents', JSON.stringify(offlineStudents));
      return Promise.resolve(); // Resolve immediately since we're offline
    }
  }

  // Update a student
  updateStudent(student: Student) {
    if (navigator.onLine) {
      // If online, update the student in Firestore
      const studentDoc = doc(this.firestore, 'Students', student.id);
      return updateDoc(studentDoc, { ...student });
    } else {
      // If offline, update the student in localStorage (for the next sync)
      let offlineStudents = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
      const index = offlineStudents.findIndex((s: Student) => s.id === student.id);
      if (index !== -1) {
        offlineStudents[index] = student;  // Update the student locally
        localStorage.setItem('offlineStudents', JSON.stringify(offlineStudents));
      }
      return Promise.resolve();  // Resolve immediately since we're offline
    }
  }

  // Sync offline students with Firestore when the app is back online
  syncOfflineStudents() {
    if (navigator.onLine) {
      const offlineStudents = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
      if (offlineStudents.length > 0) {
        offlineStudents.forEach((student: Student) => {
          this.addStudent(student).then(() => {
            // After syncing, remove the student from offline storage
            this.removeOfflineStudent(student);
          });
        });
      }
    }
  }

  // Helper function to remove a student from offline storage
  removeOfflineStudent(student: Student) {
    let offlineStudents = JSON.parse(localStorage.getItem('offlineStudents') || '[]');
    offlineStudents = offlineStudents.filter((s: Student) => s.id !== student.id);
    localStorage.setItem('offlineStudents', JSON.stringify(offlineStudents));
  }
}


/* import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, updateDoc, setDoc, query, getDocs } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Student } from '../model/Student';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private firestore: Firestore = inject(Firestore); // Inyección del servicio Firestore

  
  // Método para añadir un estudiante
  addStudent(student: Student) {
    const studentsCollection = collection(this.firestore, 'Students');
    const studentRef = doc(studentsCollection);
    student.id = studentRef.id;  // Usamos el ID generado automáticamente por Firestore
    return setDoc(studentRef, student); // Añadir el documento al collection
  }

  // Obtener todos los estudiantes
  getAllStudents(): Observable<Student[]> {
    const studentsCollection = collection(this.firestore, 'Students');
    return collectionData(studentsCollection, { idField: 'id' }) as Observable<Student[]>; // Obtiene los datos de los estudiantes
  }

  // Eliminar un estudiante
  deleteStudent(student: Student) {
    const studentDoc = doc(this.firestore, 'Students', student.id);
    return deleteDoc(studentDoc); // Eliminar el documento de Firestore
  }

  // Actualizar un estudiante
  updateStudent(student: Student) {
    const studentDoc = doc(this.firestore, 'Students', student.id);
    return updateDoc(studentDoc, { ...student }); // Actualizar solo los campos que cambiaron
  }
}
 */