import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'cs-about',
  imports: [MatIconModule, MatButtonModule, RouterLink],
  styleUrl: './about.scss',
  templateUrl: './about.html',
})
export class AboutComponent {}
