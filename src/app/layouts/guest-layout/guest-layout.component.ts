import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './guest-layout.component.html',
  styleUrls: ['./guest-layout.component.css'],
})
export class GuestLayoutComponent {
  constructor() {}
}
