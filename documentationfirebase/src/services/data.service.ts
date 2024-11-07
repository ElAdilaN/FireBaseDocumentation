import { Injectable } from '@angular/core';
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
