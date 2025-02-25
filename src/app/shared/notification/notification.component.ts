import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnChanges {
  @Input() message: string = '';
  notificationTimeout: any = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['message'] && this.message) {
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }
      this.notificationTimeout = setTimeout(() => {
        this.message = '';
      }, 5000);
    }
  }
}
