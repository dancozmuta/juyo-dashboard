import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-svg-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './svg-icon.component.html',
  styleUrls: ['./svg-icon.component.scss'],
})
export class SvgIconComponent implements OnInit, OnChanges {
  @Input() src = '';
  @Input() width?: number;
  @Input() height: number = 24;
  @Input() color = 'currentColor';
  @Input() containerClass = '';

  svgContent: SafeHtml = '';
  viewBox: string = '0 0 24 24';
  calculatedWidth: string = '24px';

  constructor(private sanitizer: DomSanitizer, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.src) {
      this.loadSvg();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src'] && this.src) {
      this.loadSvg();
    } else if (changes['width'] || changes['height']) {
      this.calculateDimensions();
    }
  }

  private loadSvg(): void {
    if (!this.src) {
      return;
    }

    fetch(this.src)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((svg) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');

        if (svgElement) {
          this.handleSvgElement(svgElement);
          // Use the inner markup of the source SVG so our outer <svg>
          // controls size and color (currentColor). This prevents nested
          // <svg> elements from isolating color propagation.
          const inner = svgElement.innerHTML;
          this.svgContent = this.sanitizer.bypassSecurityTrustHtml(inner);
        } else {
          this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
        }
        this.cd.detectChanges();
      })
      .catch((error) => console.error('Error loading SVG:', error));
  }

  private handleSvgElement(svgElement: SVGElement): void {
    const viewBoxAttr = svgElement.getAttribute('viewBox');
    if (viewBoxAttr) {
      this.viewBox = viewBoxAttr;
      this.calculateDimensions();
    }
  }

  private calculateDimensions(): void {
    if (!this.viewBox) {
      return;
    }

    const viewBoxValues = this.viewBox.split(' ').map((v) => parseFloat(v));
    if (viewBoxValues.length < 4) {
      return;
    }

    const widthRatio = viewBoxValues[2] / viewBoxValues[3];
    const heightValue = this.height;

    if (this.width) {
      this.calculatedWidth = `${this.width}px`;
    } else {
      this.calculatedWidth = `${heightValue * widthRatio}px`;
    }
  }
}
